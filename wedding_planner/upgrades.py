"""Explicit, previewed catalog upgrades preserve completed work and agreed obligations."""

from .domain import digest, due_time, relative_date, require, text, would_cycle
from . import validation


class TemplateUpgradeMixin:
    def template_upgrade(self, service, preview_only):
        require("admin" in self.roles, "Template upgrades require a wedding admin.", 403)
        require(service.get("templateSnapshot") and service["status"] not in {"completed", "cancelled", "not_applicable"}, "This service cannot receive a template upgrade.", 409)
        template = next((t for t in self.all_templates() if t["code"] == service.get("code")), None)
        require(template and template["templateVersion"] > service["templateSnapshot"]["templateVersion"], "This service already uses the current template.", 409)
        tasks = [t for t in self.items("tasks", False) if t.get("serviceId") == service["id"]]
        current = {}
        for task in tasks:
            code = task.get("templateSnapshot", {}).get("code")
            if code and (code not in current or task.get("originTemplateVersion", 1) > current[code].get("originTemplateVersion", 1)):
                current[code] = task
        actions, retained, chain = [], [], []
        new_codes = {t["code"] for t in template["tasks"]}
        for task_template in template["tasks"]:
            previous = current.get(task_template["code"])
            definition_changed = previous and previous.get("templateSnapshot") != task_template
            if previous and previous["status"] == "done" and not definition_changed:
                retained.append({"id": previous["id"], "title": previous["title"], "reason": "Completed evidence is retained."})
                chain.append(previous["id"])
                continue
            create = not previous or previous["status"] == "done"
            if previous and create:
                retained.append({"id": previous["id"], "title": previous["title"], "reason": "Completed original retained; the changed requirement creates a new check."})
            target = due_time(self.project.get("weddingDate"), task_template["offsetDays"], template["aftercare"])
            if previous and not create and previous.get("scheduleMode") == "manual":
                target = previous.get("dueAt")
            actions.append({"action": "create" if create else "update", "id": None if create else previous["id"],
                            "title": task_template["title"], "before": previous.get("dueAt") if previous else None,
                            "after": target, "template": task_template})
            chain.append(previous["id"] if not create else "new:" + task_template["code"])
        for task in tasks:
            if task.get("templateSnapshot", {}).get("code") not in new_codes:
                retained.append({"id": task["id"], "title": task["title"], "reason": "Existing obligation retained with its current deadline."})
        edges = self.dependencies()
        proposed = list(edges)
        warnings = []
        for first, second in zip(chain, chain[1:]):
            if would_cycle(proposed, first, second):
                warnings.append({"message": "The new task order conflicts with an existing dependency. Resolve that dependency first."})
            else:
                proposed.append({"predecessor_id": first, "successor_id": second})
        documents = [d for d in self.items("documents", False) if d.get("serviceId") == service["id"]]
        preview = {"fromVersion": service["templateSnapshot"]["templateVersion"], "toVersion": template["templateVersion"],
                   "changes": actions, "retained": retained, "warnings": warnings,
                   "approvalRequestAdded": template["approvalRequired"] and not any(d.get("required") for d in documents)}
        preview["previewToken"] = digest({"service": service, "template": template, "tasks": [[t["id"], t["version"]] for t in tasks],
                                         "documents": [[d["id"], d["version"]] for d in documents], "edges": edges, "preview": preview})
        if preview_only:
            return 200, preview
        reason = text(self.body.get("reason", ""), "Template upgrade reason", True)
        require(self.body.get("previewToken") == preview["previewToken"], "This plan changed. Review a new template preview.", 409, preview=preview)
        require(not warnings, warnings[0]["message"] if warnings else "Dependency conflict.", 409)
        resolved = {}
        for order, change in enumerate(actions):
            task_template = change["template"]
            previous = self.item("tasks", change["id"], False) if change["id"] else None
            value = {**(previous or validation.DEFAULTS["tasks"]), "title": task_template["title"], "titleAm": task_template.get("titleAm", ""),
                     "templateSnapshot": task_template, "originTemplateVersion": template["templateVersion"], "serviceId": service["id"],
                     "ownerUserId": previous.get("ownerUserId") if previous else service.get("ownerUserId"), "visibility": previous.get("visibility", "internal") if previous else "internal",
                     "required": task_template.get("required", True), "approvalRequired": task_template.get("approvalRequired", False),
                     "priority": task_template.get("priority", "normal"), "aftercare": template["aftercare"], "relativeOffsetDays": task_template["offsetDays"],
                     "dueAt": change["after"], "scheduleMode": previous.get("scheduleMode", "template") if previous else "template",
                     "sortOrder": previous.get("sortOrder", order) if previous else service.get("sortOrder", 0) * 100 + order, "upgradeReason": reason}
            saved = self.save_item("tasks", value, previous, "template_upgraded")
            if not previous:
                resolved["new:" + task_template["code"]] = saved["id"]
        for retained_task in retained:
            previous = self.item("tasks", retained_task["id"], False)
            if previous.get("templateSnapshot", {}).get("code") not in new_codes and previous["status"] != "done":
                self.save_item("tasks", {**previous, "scheduleMode": "manual", "upgradeReason": reason}, previous, "obligation_retained")
        for first, second in zip(chain, chain[1:]):
            self.db.execute("INSERT INTO wp_dependencies(wedding_id,predecessor_id,successor_id) VALUES(?,?,?) ON CONFLICT DO NOTHING",
                            (self.project["id"], resolved.get(first, first), resolved.get(second, second)))
        if preview["approvalRequestAdded"]:
            if template["aftercare"]:
                require("counseling" in self.identity.permissions, "Restricted aftercare files require counseling authority.", 403)
            self.save_item("documents", {**validation.DEFAULTS["documents"], "title": template["evidence"] or "Approve service readiness",
                "serviceId": service["id"], "required": True, "visibility": "restricted" if template["aftercare"] else "shared",
                "ownerUserId": service.get("ownerUserId"), "revision": 0}, action="requested")
        value = {**service, "name": template["name"], "nameAm": template["nameAm"], "category": template["category"], "templateSnapshot": template,
                 "aftercare": template["aftercare"], "approvalRequired": template["approvalRequired"], "critical": template["critical"],
                 "targetDate": relative_date(self.project.get("weddingDate"), template["relativeOffsetDays"], template["aftercare"]), "upgradeReason": reason}
        if service["status"] == "confirmed":
            value.update(status="in_progress", blockerSummary="Template changed. Review readiness checks and reconfirm.")
        result = self.save_item("services", value, service, "template_upgraded")
        self.store.audit(self.project["id"], self.identity.user_id, "template_migrated", "services", service["id"],
                         {"template": service["templateSnapshot"]}, {"template": template, "reason": reason})
        return 200, {"service": self.public_item("services", result), "preview": preview}
