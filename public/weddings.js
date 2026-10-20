/* Wedding Planning extension. Buildless, no third-party browser dependencies. */
(() => {
  'use strict';
  const root = document.getElementById('weddingWorkspace');
  // The client portal never loads the planner.
  if (!root || (typeof PORTAL !== 'undefined' && PORTAL)) return;
  const ui = {cap: {}, id: null, tab: 'overview', dashboard: null, project: null, data: {}, members: [], files: [], templates: [],
    filters: {}, cursors: {}, pages: {}, sequence: 0, wizard: null, wizardStep: 0, service: null, serviceTab: 'Plan', loading: false};
  const requestKeys = new Map();
  const words = {
    planning: ['Wedding Planning', 'የሰርግ ዕቅድ'], all: ['All weddings', 'ሁሉም ሰርጎች'], create: ['Create wedding', 'ሰርግ ይፍጠሩ'],
    studio: ['THE PLANNING STUDIO', 'የሰርግ ዕቅድ ማዕከል'], heading: ['Every celebration, considered.', 'እያንዳንዱ ሰርግ፣ በጥንቃቄ።'],
    intro: ['One connected plan, from the first meeting to the final blessing.', 'ከመጀመሪያው ስብሰባ እስከ መጨረሻው ቡራኬ የተገናኘ ዕቅድ።'],
    overview: ['Overview', 'አጠቃላይ'], services: ['Services', 'አገልግሎቶች'], tasks: ['Tasks', 'ተግባራት'], timeline: ['Timeline', 'የጊዜ ሰሌዳ'], calendar: ['Calendar', 'ቀን መቁጠሪያ'],
    vendors: ['Vendors', 'አቅራቢዎች'], budget: ['Budget', 'በጀት'], guests: ['Guests', 'እንግዶች'], documents: ['Documents', 'ሰነዶች'], boards: ['Design Boards', 'የንድፍ ሰሌዳዎች'],
    day: ['Wedding Day', 'የሰርግ ቀን'], activity: ['Activity', 'እንቅስቃሴ'], settings: ['Templates & settings', 'አብነቶች እና ቅንብሮች'],
    search: ['Search', 'ፈልግ'], status: ['Status', 'ሁኔታ'], owner: ['Owner', 'ኃላፊ'], service: ['Service', 'አገልግሎት'], category: ['Category', 'ምድብ'],
    any: ['All', 'ሁሉም'], date: ['Date', 'ቀን'], noDate: ['Date to be decided', 'ቀን አልተወሰነም'], save: ['Save', 'አስቀምጥ'], cancel: ['Cancel', 'ሰርዝ'], close: ['Close', 'ዝጋ'],
    edit: ['Edit', 'አስተካክል'], add: ['Add', 'ጨምር'], back: ['Back', 'ተመለስ'], next: ['Continue', 'ቀጥል'], draft: ['Save draft', 'ረቂቅ አስቀምጥ'],
    activate: ['Activate plan', 'ዕቅዱን አንቃ'], setup: ['Continue setup', 'ዝግጅቱን ቀጥል'], confirm: ['Confirm readiness', 'ዝግጁነትን አረጋግጥ'], complete: ['Record delivery', 'ማጠናቀቅን መዝግብ'],
    blockers: ['Critical blockers', 'አስፈላጊ እንቅፋቶች'], due: ['Due in 7 days', 'በ7 ቀናት ውስጥ'], unpaid: ['Unpaid commitments', 'ያልተከፈሉ ግዴታዎች'], countdown: ['Days to celebrate', 'ለሰርጉ የቀሩ ቀናት'],
    priorities: ['What needs your attention', 'ትኩረት የሚፈልጉ ተግባራት'], milestones: ['Key milestones', 'ዋና ደረጃዎች'], readiness: ['Service readiness', 'የአገልግሎት ዝግጁነት'],
    progress: ['Task progress', 'የተግባር ሂደት'], confirmed: ['Services confirmed', 'የተረጋገጡ አገልግሎቶች'], approvals: ['Decisions waiting', 'ውሳኔ የሚጠብቁ'],
    aftercare: ['Aftercare', 'ድህረ ጋብቻ'], aftercareHint: ['Aftercare is tracked separately from wedding-day readiness.', 'ድህረ ጋብቻ ከሰርግ ዝግጁነት ተለይቶ ይከታተላል።'],
    ready: ['Ready for the day', 'ለሰርጉ ዝግጁ'], inPlanning: ['Planning in progress', 'ዝግጅት በሂደት ላይ'], open: ['Open', 'ክፈት'], overdue: ['Overdue', 'ጊዜው ያለፈ'],
    empty: ['Nothing here yet.', 'እስካሁን ምንም የለም።'], emptyWeddings: ['Your next celebration starts here.', 'ቀጣዩ ሰርግዎ እዚህ ይጀምራል።'],
    emptyWeddingsHint: ['Create a wedding, choose its services, and turn the details into a working plan.', 'ሰርግ ይፍጠሩ፣ አገልግሎቶችን ይምረጡ እና ዕቅድ ያዘጋጁ።'],
    noMatches: ['No matches. Try another filter.', 'ምንም አልተገኘም። ሌላ ማጣሪያ ይሞክሩ።'], loading: ['Loading your workspace…', 'ዕቅዱ እየተጫነ ነው…'],
    saved: ['Changes saved.', 'ለውጦች ተቀምጠዋል።'], more: ['Load more', 'ተጨማሪ ጫን'], reason: ['Reason for change', 'የለውጡ ምክንያት'], evidence: ['Verification evidence', 'የማረጋገጫ ማስረጃ'],
    changeDate: ['Change date', 'ቀን ቀይር'], preview: ['Preview impact', 'የለውጥ ተፅዕኖ ይመልከቱ'], applyDate: ['Approve date change', 'የቀን ለውጥን አጽድቅ'],
    reservations: ['External bookings stay unchanged and need reconfirmation.', 'የውጭ ቦታ ማስያዣዎች አይቀየሩም፤ ድጋሚ ማረጋገጥ ያስፈልጋል።'],
    team: ['Team & access', 'ቡድን እና ፈቃድ'], refresh: ['Refresh', 'አድስ'], export: ['Export offline plan', 'ከመስመር ውጭ ዕቅድ አውርድ'], print: ['Print run sheet', 'የቀን ዕቅድ አትም'],
    title: ['Title', 'ርዕስ'], name: ['Name', 'ስም'], deadline: ['Deadline', 'የመጨረሻ ቀን'], visibility: ['Visible to', 'የሚታይለት'], internal: ['Planning team', 'የዕቅድ ቡድን'], shared: ['Shared with members', 'ለአባላት የተጋራ'],
    client: ['Couple', 'ጥንዶች'], vendor: ['Assigned vendor', 'የተመደበ አቅራቢ'], church: ['Church liaison', 'የቤተ ክርስቲያን ተወካይ'], required: ['Required for readiness', 'ለዝግጁነት የሚያስፈልግ'],
    priority: ['Priority', 'ቅድሚያ'], notes: ['Notes', 'ማስታወሻ'], description: ['Description', 'መግለጫ'], enabled: ['Included in this wedding', 'በዚህ ሰርግ የተካተተ'],
    upload: ['Upload revision', 'አዲስ ስሪት ጫን'], review: ['Review decision', 'ውሳኔ መዝግብ'], history: ['Files & review history', 'ፋይሎች እና የግምገማ ታሪክ'],
    download: ['Download', 'አውርድ'], revision: ['Revision', 'ስሪት'], decision: ['Decision', 'ውሳኔ'], comment: ['Review comment', 'የግምገማ አስተያየት'],
    fileHint: ['PDF, PNG, JPEG or UTF-8 text · up to 1 MB. Previous revisions are retained.', 'PDF፣ PNG፣ JPEG ወይም ጽሑፍ፤ እስከ 1 MB። ቀድሞ የነበሩ ስሪቶች ይቀመጣሉ።'],
    estimated: ['Estimated', 'የተገመተ'], committed: ['Committed', 'የተያዘ'], actual: ['Actual expenses', 'ትክክለኛ ወጪ'], paid: ['Paid', 'የተከፈለ'], remaining: ['Budget remaining', 'የቀረ በጀት'],
    payments: ['Payment schedule', 'የክፍያ ሰሌዳ'], amount: ['Amount (ETB)', 'መጠን (ብር)'], agreed: ['Client-approved amount', 'ጥንዶቹ ያጸደቁት መጠን'],
    reconcile: ['Link payment', 'ክፍያ አገናኝ'], financeHint: ['Record commitments and reconcile payments with existing transactions.', 'ግዴታዎችን ይመዝግቡ እና ክፍያዎችን ከነባር ግብይቶች ጋር ያገናኙ።'],
    invited: ['Invited', 'የተጋበዙ'], accepted: ['Confirmed guests', 'የተረጋገጡ እንግዶች'], pending: ['Awaiting RSVP', 'ምላሽ በመጠባበቅ'], table: ['Table', 'ጠረጴዛ'],
    issue: ['Incident', 'ችግር'], incidents: ['Open incidents', 'ክፍት ችግሮች'], arrival: ['Arrivals & contacts', 'መድረሻ እና አድራሻ'], arrived: ['Mark arrived', 'መድረሱን አረጋግጥ'],
    runSheet: ['The day, moment by moment.', 'የሰርጉ ቀን፣ ቅጽበት በቅጽበት።'], localTime: ['All times · Addis Ababa (UTC+3)', 'ሁሉም ሰዓቶች፦ አዲስ አበባ (UTC+3)'],
    reminders: ['Reminders', 'ማስታወሻዎች'], generate: ['Check reminders', 'ማስታወሻዎችን አዘጋጅ'], acknowledge: ['Mark read', 'እንደተነበበ አድርግ'], you: ['You', 'እርስዎ'],
    spiritual: ['Spiritual & church', 'መንፈሳዊ እና ቤተ ክርስቲያን'], atmosphere: ['Venue & atmosphere', 'ቦታ እና ድባብ'], people: ['Style & people', 'አለባበስ እና ተሳታፊዎች'],
    hospitality: ['Hospitality', 'እንግዳ ተቀባይነት'], logistics: ['Logistics & readiness', 'ቅንጅት እና ዝግጁነት'],
    coupleStep: ['Couple', 'ጥንዶች'], detailsStep: ['Wedding details', 'የሰርግ ዝርዝሮች'], churchStep: ['Ceremony', 'ሥነ ሥርዓት'], packageStep: ['Services', 'አገልግሎቶች'], planStep: ['Generate plan', 'ዕቅድ አዘጋጅ'], reviewStep: ['Review', 'ይገምግሙ'],
    weddingTitle: ['Couple display name', 'የጥንዶቹ ስም'], existingClient: ['Link existing couple record', 'ነባር የጥንዶች መዝገብ ያገናኙ'], noLink: ['Choose a record (optional)', 'መዝገብ ይምረጡ (አማራጭ)'],
    guestsEstimate: ['Expected guests', 'የሚጠበቁ እንግዶች'], totalBudget: ['Total budget (ETB)', 'ጠቅላላ በጀት (ብር)'], city: ['City', 'ከተማ'], language: ['Preferred language', 'ተመራጭ ቋንቋ'], calendarPreference: ['Date display', 'የቀን አቀራረብ'],
    ceremonyType: ['Ceremony type', 'የሥነ ሥርዓት አይነት'], churchLocation: ['Church / ceremony location', 'ቤተ ክርስቲያን / የሥነ ሥርዓት ቦታ'], venueLocation: ['Reception venue', 'የመስተንግዶ ቦታ'],
    clergyHint: ['Confirm church requirements and timing with the relevant clergy.', 'የቤተ ክርስቲያኑን መስፈርቶች እና ቀን ከካህናት ጋር ያረጋግጡ።'],
    package: ['Planning package', 'የዕቅድ ጥቅል'], selectAll: ['Select all', 'ሁሉንም ምረጥ'], clearAll: ['Clear selection', 'ምርጫውን አጥፋ'],
    unscheduledHint: ['Without a wedding date, tasks will remain unscheduled until you set one.', 'የሰርግ ቀን እስኪወሰን ተግባራቱ ያለ ቀን ይቀመጣሉ።'],
    deadlineHint: ['Suggested deadlines are editable. Short-notice deadlines stay visible even when overdue.', 'የተጠቆሙ ቀናት ሊስተካከሉ ይችላሉ። ጊዜያቸው ያለፈ ተግባራትም ይታያሉ።'],
    blocked: ['Blocked', 'የታገደ'], days: ['days', 'ቀናት'], unassigned: ['Unassigned', 'ያልተመደበ'], reload: ['Reload latest version', 'የቅርብ ስሪቱን ጫን'],
    calendarHint: ['Calendar and timeline show the same tasks and appointments.', 'ቀን መቁጠሪያ እና ሰሌዳው ተመሳሳይ ተግባራትን እና ቀጠሮዎችን ያሳያሉ።'],
    templateHint: ['Template edits apply to future plans. Existing wedding snapshots keep their original version.', 'የአብነት ለውጦች ለወደፊት ዕቅዶች ይተገበራሉ፤ ነባር ዕቅዶች አይቀየሩም።'],
    questionnaire: ['Couple questionnaire', 'የጥንዶች መጠይቅ'], continuePlanner: ['Continue to planner', 'ወደ ዕቅዱ ቀጥል'],
    serviceDetails: ['Service details', 'የአገልግሎት ዝርዝሮች'], chooseServices: ['Choose services', 'አገልግሎቶችን ምረጥ'],
  };
  const statesAm = {draft:'ረቂቅ',planning:'በዝግጅት ላይ',final_review:'የመጨረሻ ግምገማ',event_live:'ሰርጉ በሂደት ላይ',completed:'ተጠናቋል',archived:'በማህደር',cancelled:'ተሰርዟል',todo:'ያልተጀመረ',not_started:'ያልተጀመረ',in_progress:'በሂደት ላይ',blocked:'የታገደ',done:'ተጠናቋል',awaiting_approval:'ማጽደቅ በመጠባበቅ',confirmed:'ተረጋግጧል',not_applicable:'አይመለከትም',requested:'ተጠይቋል',under_review:'በግምገማ ላይ',approved:'ጸድቋል',changes_requested:'ማሻሻያ ተጠይቋል',rejected:'ውድቅ ተደርጓል',pending:'በመጠባበቅ',paid:'ተከፍሏል',failed:'አልተሳካም',accepted:'ተቀባይነት አግኝቷል',declined:'አልተቀበሉም',shortlisted:'በምርጫ ዝርዝር',quoted:'ዋጋ ቀርቧል',selected:'ተመርጧል',contracted:'ውል ተፈርሟል',delivered:'ቀርቧል',closed:'ተዘግቷል',verified:'ተረጋግጧል',underway:'በሂደት ላይ',delayed:'ዘግይቷል',skipped:'ታልፏል',open:'ክፍት',investigating:'በመፈተሽ ላይ',resolved:'ተፈትቷል'};
  const lang = () => document.documentElement.lang === 'am' ? 'am' : 'en';
  const tr = key => words[key]?.[lang() === 'am' ? 1 : 0] || key;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const label = value => lang() === 'am' && statesAm[value] ? statesAm[value] : String(value || '').replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
  const serviceName = service => lang() === 'am' && service.nameAm ? service.nameAm : service.name;
  const taskName = task => lang() === 'am' && task.titleAm ? task.titleAm : task.title;
  const money = value => new Intl.NumberFormat(lang()==='am'?'am-ET':'en-ET',{style:'currency',currency:'ETB',maximumFractionDigits:2}).format((value || 0)/100);
  const amountValue = value => `${Math.floor((value || 0)/100)}.${String((value || 0)%100).padStart(2,'0')}`;
  const toMinor = value => {
    if (!/^\d{1,11}(\.\d{1,2})?$/.test(String(value))) throw new Error(lang()==='am'?'ዋጋውን በብር እና ሳንቲም ያስገቡ።':'Enter an amount in ETB with up to two decimal places.');
    const [whole,cents=''] = String(value).split('.'); return Number(whole)*100+Number(cents.padEnd(2,'0'));
  };
  const isoDay = value => {if(!value)return '';const parts=new Intl.DateTimeFormat('en',{timeZone:'Africa/Addis_Ababa',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));const part=type=>parts.find(p=>p.type===type).value;return `${part('year')}-${part('month')}-${part('day')}`;};
  function dateText(value, time=false) {
    if (!value) return tr('noDate');
    const civil = /^\d{4}-\d\d-\d\d$/.test(value);
    const cal = ui.project?.calendarPreference === 'ethiopian' ? 'ethiopic' : 'gregory';
    const options = {calendar:cal, timeZone: civil ? 'UTC' : 'Africa/Addis_Ababa', day:'numeric', month:'short',year:'numeric'};
    if (time) {options.hour='numeric';options.minute='2-digit';}
    return new Intl.DateTimeFormat(lang()==='am'?'am-ET':'en-GB',options).format(new Date(civil ? value+'T12:00:00Z' : value));
  }
  const dateMarkup = (value,time=false) => value ? `<time datetime="${esc(value)}" title="${esc(value)}">${esc(dateText(value,time))}</time>` : `<span class="wp-muted">${tr('noDate')}</span>`;
  const timeText = value => value ? new Intl.DateTimeFormat(lang()==='am'?'am-ET':'en-GB',{timeZone:'Africa/Addis_Ababa',hour:'2-digit',minute:'2-digit'}).format(new Date(value)) : '—';
  const localInput = value => value ? new Date(new Date(value).getTime()+3*3600000).toISOString().slice(0,16) : '';
  const ownerName = id => ui.members.find(member=>member.userId===id)?.name || (id===ui.cap.userId?tr('you'):id || tr('unassigned'));
  const badge = status => `<span class="wp-badge wp-state-${esc(status)}"><span aria-hidden="true">${['done','approved','confirmed','completed','verified','paid','resolved'].includes(status)?'✓':['blocked','delayed','rejected','failed'].includes(status)?'!':'·'}</span>${esc(label(status))}</span>`;
  const button = (action,text,id='',primary=false,extra='') => `<button type="button" class="wp-btn${primary?' wp-primary':''}" data-wp-action="${esc(action)}"${id?` data-id="${esc(id)}"`:''} ${extra}>${esc(text)}</button>`;
  const empty = (text=tr('empty'),hint='') => `<div class="wp-empty"><span class="wp-empty-icon" aria-hidden="true">✧</span><h3>${esc(text)}</h3>${hint?`<p>${esc(hint)}</p>`:''}</div>`;
  const section = (title,content,actions='') => `<section class="wp-card"><div class="wp-card-head"><h2>${esc(title)}</h2>${actions}</div>${content}</section>`;
  const permissions = () => ui.project?.permissions || {};
  const base = suffix => `weddings/${encodeURIComponent(ui.id)}${suffix?'/'+suffix:''}`;
  function toast(message) {
    const element = document.getElementById('toast');
    if (typeof showToast === 'function') showToast(message);
    else if (element) {element.textContent=message;element.classList.add('is-visible');setTimeout(()=>element.classList.remove('is-visible'),4000);}
  }
  async function api(path, method='GET', body, options={}) {
    const headers = {'Accept':'application/json'};
    const signature = method+path+JSON.stringify(body || {});
    if (body !== undefined) headers['Content-Type']='application/json';
    if (method==='POST') {
      if (!requestKeys.has(signature)) requestKeys.set(signature,crypto.randomUUID());
      headers['Idempotency-Key']=requestKeys.get(signature);
    }
    if (body?.version !== undefined) headers['If-Match']=String(body.version);
    const response = await fetch('/api/v1/'+path,{method,headers,credentials:'same-origin',cache:'no-store',body:body===undefined?undefined:JSON.stringify(body),signal:options.signal});
    const result = await response.json();
    if (!response.ok) {const error=new Error(result.error || 'The request failed.');error.data=result;error.status=response.status;throw error;}
    requestKeys.delete(signature);
    return result;
  }
  function route() {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0]!=='weddings') return {id:null,tab:'overview'};
    return {id:parts[1] && parts[1]!=='new' ? decodeURIComponent(parts[1]) : null,tab:parts[2] || 'overview'};
  }
  function go(id=null,tab='overview',replace=false) {
    ui.filters={};ui.cursors={};ui.pages={};
    const path = '/weddings'+(id?'/'+encodeURIComponent(id)+'/'+tab:'');
    history[replace?'replaceState':'pushState']({},'',path);
    if (typeof state !== 'undefined' && state.currentStep!==5) setStep(5);
    else loadRoute();
  }
  function queryString(extra={}) {
    return new URLSearchParams({...ui.filters,...extra}).toString();
  }
  async function loadCollection(name,extra={}) {return api(base(name)+'?'+queryString({limit:50,...extra}));}
  async function loadRoute(append=false) {
    const sequence=++ui.sequence;
    Object.assign(ui,route());
    // Client requests belong to the planner's home, not to an open wedding.
    document.getElementById('portalRequests')?.toggleAttribute('data-in-wedding',Boolean(ui.id));
    ui.loading=true;
    if (!append) root.innerHTML=`<div class="wp-loading" role="status">${tr('loading')}</div>`;
    try {
      if (!ui.cap.enabled) throw new Error(ui.capError?say('The planning service is not reachable. Start it with npm run dev, then retry.','የዕቅድ አገልግሎቱ አይገኝም። በnpm run dev ያስጀምሩት፣ ከዚያ እንደገና ይሞክሩ።'):say('Wedding planning is turned off for this workspace.','የሰርግ ዕቅድ ለዚህ የሥራ ቦታ ጠፍቷል።'));
      if (!ui.cap.authenticated) throw new Error('Sign in through the host application to use Wedding Planning.');
      if (!ui.id) {
        const response=await api('weddings?'+queryString({limit:24,...(append&&ui.data.list?.nextCursor?{cursor:ui.data.list.nextCursor}:{})}));
        if (sequence!==ui.sequence) return;
        ui.data.list={...response,items:append?[...ui.data.list.items,...response.items]:response.items};ui.project=null;
        renderList();
      } else {
        let dashboard=await api(base('dashboard'));
        if (sequence!==ui.sequence) return;
        let questionnaireReview=null;
        const wedding=dashboard.wedding;
        if(!append&&wedding.clientId&&wedding.permissions.configure&&ui.cap.canAccessClients&&['draft','planning','final_review'].includes(wedding.status)) {
          const source=await api('weddings/clients/'+wedding.clientId);
          if(sequence!==ui.sequence)return;
          if(source.selectedServiceCodes.length&&source.signature!==wedding.questionnaire?.signature) {
            const path=`weddings/clients/${wedding.clientId}/plan`;
            try {await api(path,'POST',{});dashboard=await api(base('dashboard'));}
            catch(error){if(!error.data?.questionnairePreview)throw error;questionnaireReview={path,preview:error.data.questionnairePreview};}
          }
        }
        if(sequence!==ui.sequence)return;
        ui.dashboard=dashboard;ui.project=dashboard.wedding;
        if (permissions().configure) ui.members=(await api(base('members'))).items;
        else ui.members=[];
        const collections={tasks:['tasks'],timeline:['tasks','milestones','events','vendor-assignments'],calendar:['tasks','events','milestones','vendor-assignments'],vendors:['vendor-assignments'],budget:['budget-lines',...(permissions().finance?['payment-milestones']:[])],guests:['guests'],documents:['document-requests'],boards:['design-boards'],day:['events','issues','vendor-assignments'],activity:['activity','notifications']};
        let monthOptions={};
        if (ui.tab==='calendar') {
          ui.month ||= (ui.project.weddingDate || isoDay(new Date().toISOString())).slice(0,7);
          ui.calendarAnchor ||= ui.project.weddingDate || isoDay(new Date().toISOString());
          monthOptions={...calendarRange(),limit:100};
        }
        const names=(collections[ui.tab] || []).filter(name=>!append || append===name);
        const responses=await Promise.all(names.map(name=>loadCollection(name,{...monthOptions,...(ui.tab==='day'&&name==='events'?{limit:100}:{}),...(append&&ui.data[name]?.nextCursor?{cursor:ui.data[name].nextCursor}:{})})));
        if (sequence!==ui.sequence) return;
        responses.forEach((response,i)=>{const name=names[i];ui.data[name]={...response,items:append?[...(ui.data[name]?.items || []),...response.items]:response.items};});
        if (ui.tab==='overview') ui.data.activity=await api(base('activity')+'?limit=5');
        if (sequence!==ui.sequence) return;
        renderWorkspace();
        if(questionnaireReview)showQuestionnairePreview(questionnaireReview.path,{},questionnaireReview.preview);
      }
    } catch(error) {
      if(sequence!==ui.sequence)return;
      root.innerHTML=`<div class="wp-alert" role="alert"><h2>${esc(error.message)}</h2>${button('retry',tr('refresh'))}</div>`;
    } finally {if(sequence===ui.sequence)ui.loading=false;}
  }
  const data = name => ui.data[name]?.items || [];
  const pager = name => ui.data[name]?.nextCursor ? `<div class="wp-pagination">${button('more',tr('more'),name)}</div>` : '';
  function renderList() {
    const rows=ui.data.list.items;
    root.innerHTML=`<div class="wp-page-heading"><div><div class="eyebrow">${tr('studio')}</div><h1 tabindex="-1">${tr('heading')}</h1><p>${tr('intro')}</p></div><div class="wp-actions">${ui.cap.canManageTemplates?button('templates',tr('settings')):''}${ui.cap.canCreate?button('create',tr('create'),'',true):''}</div></div>
      <div class="wp-toolbar"><label class="wp-search"><svg class="ui-icon" aria-hidden="true"><use href="#icon-search"></use></svg><input type="search" data-wp-filter="q" aria-label="${tr('search')}" placeholder="${tr('search')}" value="${esc(ui.filters.q || '')}"></label><label>${tr('status')}<select data-wp-filter="status"><option value="">${tr('any')}</option>${['draft','planning','final_review','event_live','completed','archived','cancelled'].map(s=>`<option value="${s}" ${ui.filters.status===s?'selected':''}>${esc(label(s))}</option>`).join('')}</select></label><span class="wp-muted">${ui.data.list.total} ${tr('all').toLocaleLowerCase()}</span></div>
      ${rows.length?`<div class="wp-wedding-grid">${rows.map(w=>`<article class="wp-wedding-card"><div class="wp-card-head">${badge(w.status)}<span class="wp-monogram" aria-hidden="true">${esc(w.title.charAt(0))}</span></div><h2><button type="button" class="wp-title-link" data-wp-action="open-wedding" data-id="${esc(w.id)}">${esc(w.title)}</button></h2><p>${dateMarkup(w.weddingDate)}${w.city?' · '+esc(w.city):''}</p><div class="wp-progress"><span style="width:${w.health.taskProgress}%"></span></div><div class="wp-card-foot"><span>${w.health.taskProgress}% ${tr('progress').toLocaleLowerCase()}</span>${w.health.criticalBlockers?`<span class="wp-risk">! ${w.health.criticalBlockers} ${tr('blockers').toLocaleLowerCase()}</span>`:esc(label(w.status))}</div><div class="wp-card-foot"><span>${w.health.servicesConfirmed} / ${w.health.activeServices} ${tr('confirmed').toLocaleLowerCase()}</span>${button('open-wedding',tr('open')+' →',w.id)}</div></article>`).join('')}</div>`:empty(ui.filters.q || ui.filters.status?tr('noMatches'):tr('emptyWeddings'),tr('emptyWeddingsHint'))}${pager('list')}`;
    planningContext();
  }
  function renderWorkspace() {
    const w=ui.project;
    const tabs=[['overview','overview'],['services','services'],['tasks','tasks'],['timeline','timeline'],['calendar','calendar'],['vendors','vendors'],['budget','budget'],['guests','guests'],['documents','documents'],['boards','boards'],['day','day'],['activity','activity']];
    const views={overview:renderOverview,services:renderServicesPage,tasks:renderTasks,timeline:renderTimeline,calendar:renderCalendar,vendors:renderVendors,budget:renderBudget,guests:renderGuests,documents:renderDocuments,boards:renderBoards,day:renderDay,activity:renderActivity};
    root.innerHTML=`<div class="wp-breadcrumb">${button('all',tr('all'))}<span aria-hidden="true">/</span><span>${esc(w.title)}</span></div><div class="wp-page-heading wp-project-heading"><div><div class="eyebrow">${tr('planning')}</div><h1 tabindex="-1">${esc(w.title)}</h1><p>${dateMarkup(w.weddingDate)} <span aria-hidden="true">·</span> ${esc(w.city || 'Addis Ababa')} <span aria-hidden="true">·</span> ${w.guestEstimate} ${tr('guests').toLocaleLowerCase()}</p></div><div class="wp-actions">${badge(w.status)}${permissions().configure?(ui.cap.canAccessClients?button('questionnaire',w.clientId?tr('questionnaire'):say('Link questionnaire','መጠይቅ አገናኝ')):'')+(w.status==='draft'?button('setup',tr('setup'),'',true):button('edit-wedding',tr('edit')))+button('date-change',tr('changeDate'))+button('members',tr('team')):''}</div></div>
      <nav class="wp-tabs" aria-label="${tr('planning')}">${tabs.map(([id,key])=>`<button type="button" data-wp-action="tab" data-id="${id}" class="${ui.tab===id?'is-active':''}" ${ui.tab===id?'aria-current="page"':''}>${tr(key)}</button>`).join('')}</nav><div id="wpTabContent">${(views[ui.tab] || renderOverview)()}</div>`;
    planningContext();
  }
  function planningContext() {
    if(typeof state!=='undefined'&&state.currentStep!==5)return;
    document.querySelector('#resetDraftButton span').textContent=tr('create');
    document.querySelector('.sidebar-search').hidden=true;
    document.getElementById('topbarCoupleName').textContent=ui.project?.title||'';
    document.querySelector('#saveState [data-i18n="savedLocally"]').textContent=tr('planning');
    const recent=(ui.data.list?.items||[]).slice(0,6);
    document.getElementById('recentCouples').innerHTML=recent.length?recent.map(w=>`<button type="button" class="wp-recent-wedding" data-wp-action="open-wedding" data-id="${w.id}">${esc(w.title)}<small>${dateMarkup(w.weddingDate)}</small></button>`).join(''):button('all',tr('all'));
  }
  function stats(items) {return `<div class="wp-stats">${items.map(([title,value,detail,action])=>`<${action?'button':'div'} ${action?`type="button" data-wp-action="${action}"`:''} class="wp-stat"><span>${esc(title)}</span><strong class="${String(value).length>10?'wp-long-number':''}">${typeof value==='string'?value.split(/\s+/).map(part=>`<span class="wp-number-part">${esc(part)}</span>`).join(' '):esc(value)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</${action?'button':'div'}>`).join('')}</div>`;}
  function taskRow(task) {
    const overdue=task.dueAt && new Date(task.dueAt)<new Date() && !['done','cancelled'].includes(task.status);
    return `<div class="wp-task-row"><span class="wp-task-symbol ${task.status==='done'?'wp-done':''}" aria-hidden="true">${task.status==='done'?'✓':task.status==='blocked'?'!':'○'}</span><div class="wp-task-main"><button class="wp-title-link" type="button" data-wp-action="edit-task" data-id="${task.id}">${esc(taskName(task))}</button><small>${esc(serviceName(ui.dashboard.services.find(s=>s.id===task.serviceId) || {name:tr('planning')}))} · ${esc(ownerName(task.ownerUserId))}</small></div><div class="wp-task-meta"><span class="${overdue?'wp-risk':''}">${dateMarkup(task.dueAt)}${overdue?' · '+tr('overdue'):''}</span>${badge(task.status)}</div></div>`;
  }
  function questionnaireSummary() {
    const source=ui.project?.questionnaire;
    if(!source||!permissions().configure||!ui.cap.canAccessClients)return '';
    const d=source.details;
    const rows=[
      [say('Bride','ሙሽራ'),[d.brideName,d.bridePhone,d.brideAddress].filter(Boolean).join(' · ')],
      [say('Groom','ሙሽራው'),[d.groomName,d.groomPhone,d.groomAddress].filter(Boolean).join(' · ')],
      [say('Event days','የዝግጅቱ ቀናት'),d.eventDays?`${d.eventDays} ${tr('days')}`:''],
      [say('Meal program','የምግብ ፕሮግራም'),['breakfast','lunch','dinner'].every(meal=>(d.mealProgram||[]).includes(meal))?say('3 Course Full Day Program','የ3 ኮርስ ሙሉ ቀን ፕሮግራም'):(d.mealProgram||[]).map(meal=>({breakfast:say('Breakfast','ቁርስ'),lunch:say('Lunch','ምሳ'),dinner:say('Dinner','እራት')})[meal]||meal).join(' · ')],
      [tr('churchLocation'),ui.project.churchLocation],[tr('venueLocation'),ui.project.venueLocation],
      [say('Agreed professional fee','የተስማሙበት የሙያ ክፍያ'),d.totalFee!==undefined&&d.totalFee!==''?`${d.totalFee} ETB`:''],
      [say('Photo & media consent','የፎቶ እና ሚዲያ ፈቃድ'),d.mediaConsent==='yes'?say('Consented','ተፈቅዷል'):say('Do not post images showing faces','ፊት የሚያሳይ ፎቶ አይለጠፍ')],
      [tr('notes'),d.generalNotes],
    ];
    return `<div id="wpQuestionnaireSummary">${section(tr('questionnaire'),`<dl class="wp-definition">${rows.filter(([,value])=>value).map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`,button('questionnaire',tr('edit')))}</div>`;
  }
  function renderOverview() {
    const d=ui.dashboard,r=d.readiness,w=ui.project;
    const countdown=w.weddingDate?Math.ceil((Date.parse(w.weddingDate+'T00:00:00+03:00')-Date.parse(isoDay(new Date().toISOString())+'T00:00:00+03:00'))/86400000):'—';
    const blockers=r.blockers.slice(0,5).map(b=>`<li><span class="wp-risk" aria-hidden="true">!</span><span>${esc(b.title)}</span>${button(b.type==='milestone'?'edit-milestone':b.type==='task'?'edit-task':b.serviceId?'service':'tab',tr('open'),b.type==='milestone'||b.type==='task'?b.id:b.serviceId || 'day')}</li>`).join('');
    const readinessCard=`<div class="wp-readiness"><div class="wp-readiness-number">${r.taskProgress}<small>%</small></div><div><strong>${tr('progress')}</strong><p>${r.servicesConfirmed} / ${r.activeServices} ${tr('confirmed').toLocaleLowerCase()}</p></div></div><div class="wp-progress"><span style="width:${r.taskProgress}%"></span></div><p class="wp-readiness-state ${r.ready?'wp-positive':''}">${r.ready?'✓':'○'} ${tr(r.ready?'ready':'inPlanning')}</p>${r.aftercareServices?`<p class="wp-caption">${tr('aftercareHint')}</p>`:''}`;
    return `${stats([[tr('blockers'),r.criticalBlockers,r.criticalBlockers?tr('inPlanning'):tr('ready'),'show-blockers'],[tr('due'),d.tasksDueSoon,`${d.overdueTasks} ${tr('overdue').toLocaleLowerCase()}`,'tasks-tab'],...(d.budget?[[tr('unpaid'),money(d.budget.outstandingMinor),tr('payments'),'budget-tab']]:[[tr('approvals'),d.approvalsWaiting,tr('documents'),'documents-tab']]),[tr('countdown'),countdown,tr('localTime')]])}
      ${questionnaireSummary()}
      ${w.status==='draft'?`<div class="wp-callout"><div><strong>${tr('setup')}</strong><p>${tr('unscheduledHint')}</p></div>${button('setup',tr('activate'),'',true)}</div>`:''}
      ${r.criticalBlockers?section(tr('blockers'),`<ul class="wp-blockers" id="wpBlockers">${blockers}</ul>`):''}
      <div class="wp-overview-grid"><div>${section(tr('priorities'),d.nextActions.length?d.nextActions.map(taskRow).join(''):empty(),button('tasks-tab',tr('any')+' →'))}${section(tr('milestones'),d.milestones.length?d.milestones.map(m=>`<div class="wp-milestone"><span class="wp-task-symbol" aria-hidden="true">${m.status==='verified'?'✓':'◇'}</span><div><strong>${esc(m.title)}</strong><small>${dateMarkup(m.dueAt)}</small></div>${badge(m.status)}${permissions().verifyChurch?button('edit-milestone',tr('edit'),m.id):''}</div>`).join(''):empty(),permissions().configure?button('new-milestone','+ '+tr('add')):'')}</div><div>${section(tr('readiness'),readinessCard)}${section(tr('vendors'),`<p class="wp-number-inline">${d.vendorsConfirmed}<span> / ${d.vendorsTotal}</span></p><p class="wp-muted">${tr('confirmed')}</p>`,button('tab',tr('open'),'vendors'))}${section(tr('approvals'),`<p class="wp-number-inline">${d.approvalsWaiting}</p>`,button('documents-tab',tr('review')))}</div></div>
      <div class="wp-category-grid">${['spiritual','atmosphere','people','hospitality','logistics'].map(cat=>{const services=d.services.filter(s=>s.category===cat&&s.enabled);return `<button class="wp-category-card" data-wp-action="category" data-id="${cat}"><span>${tr(cat)}</span><strong>${services.filter(s=>['confirmed','completed'].includes(s.status)).length}<small> / ${services.length}</small></strong></button>`;}).join('')}</div>${section(tr('activity'),activityRows(data('activity').slice(0,5)),button('tab',tr('open'),'activity'))}`;
  }
  function renderServicesPage() {
    const services=ui.dashboard.services.filter(s=>(ui.filters.included==='all'||s.enabled)&&(!ui.filters.category||s.category===ui.filters.category)&&(!ui.filters.q||serviceName(s).toLowerCase().includes(ui.filters.q.toLowerCase())));
    return `<div class="wp-toolbar">${permissions().configure&&ui.cap.canAccessClients?button('questionnaire-services',tr('chooseServices'),'',true):''}<label>${tr('services')}<select data-wp-filter="included"><option value="">${say('Selected services','የተመረጡ አገልግሎቶች')}</option><option value="all" ${ui.filters.included==='all'?'selected':''}>${say('Include removed services','የተወገዱትንም አሳይ')}</option></select></label></div>${toolbar('services')}<div class="wp-service-grid">${services.map(s=>`<article class="wp-service-card ${!s.enabled?'wp-disabled':''}"><div class="wp-card-head"><span class="wp-category-label">${tr(s.category)}</span>${badge(s.blockerSummary?'blocked':s.status)}</div><h2><button type="button" class="wp-title-link" data-wp-action="service" data-id="${s.id}">${esc(serviceName(s))}</button></h2><p class="wp-muted">${esc(ownerName(s.ownerUserId))}${s.aftercare?' · '+tr('aftercare'):''}</p><div class="wp-progress"><span style="width:${s.taskTotal?s.taskDone/s.taskTotal*100:0}%"></span></div><p class="wp-caption">${s.taskDone} / ${s.taskTotal} ${tr('tasks').toLocaleLowerCase()} · ${dateMarkup(s.targetDate)}</p>${s.nextTask?`<div class="wp-next-task"><small>${tr('next')}</small><button type="button" class="wp-title-link" data-wp-action="edit-task" data-id="${s.nextTask.id}">${esc(taskName(s.nextTask))}</button></div>`:''}<div class="wp-card-foot"><span>${!s.enabled?esc(label('not_applicable')):''}</span>${button('service',tr('open')+' →',s.id)}</div></article>`).join('')}</div>${!services.length?empty(tr('noMatches')):''}`;
  }
  function toolbar(collection) {
    const names={tasks:'new-task',services:'new-service',vendors:'new-vendor',guests:'new-guest',documents:'new-document',boards:'new-board',events:'new-event'};
    return `<div class="wp-toolbar"><label class="wp-search"><svg class="ui-icon" aria-hidden="true"><use href="#icon-search"></use></svg><input type="search" data-wp-filter="q" aria-label="${tr('search')}" placeholder="${tr('search')}" value="${esc(ui.filters.q||'')}"></label>${collection==='services'?`<label>${tr('category')}<select data-wp-filter="category"><option value="">${tr('any')}</option>${['spiritual','atmosphere','people','hospitality','logistics'].map(c=>`<option value="${c}" ${ui.filters.category===c?'selected':''}>${tr(c)}</option>`).join('')}</select></label>`:''}${['tasks','vendors','documents'].includes(collection)?`<label>${tr('status')}<select data-wp-filter="status"><option value="">${tr('any')}</option>${(statusOptions[collection]||[]).map(s=>`<option value="${s}" ${ui.filters.status===s?'selected':''}>${esc(label(s))}</option>`).join('')}</select></label>`:''}${collection==='tasks'?`<label>${tr('owner')}<select data-wp-filter="owner"><option value="">${tr('any')}</option>${ui.members.map(m=>`<option value="${esc(m.userId)}" ${ui.filters.owner===m.userId?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label><label>${tr('service')}<select data-wp-filter="serviceId"><option value="">${tr('any')}</option>${ui.dashboard.services.map(s=>`<option value="${s.id}" ${ui.filters.serviceId===s.id?'selected':''}>${esc(serviceName(s))}</option>`).join('')}</select></label>`:''}<span class="wp-toolbar-spacer"></span>${permissions().edit&&names[collection]?button(names[collection],'+ '+tr('add'),'',true):''}</div>`;
  }
  function renderTasks() {return `${toolbar('tasks')}${section(tr('tasks'),data('tasks').length?data('tasks').map(taskRow).join(''):empty(tr('noMatches')))}${pager('tasks')}`;}
  function renderTimeline() {
    const records=calendarItems().sort((a,b)=>(a.at||'9999').localeCompare(b.at||'9999'));
    return `<div class="wp-toolbar"><p class="wp-muted">${tr('calendarHint')}</p>${permissions().edit?button('new-task','+ '+tr('add')):''}</div>${section(tr('timeline'),records.map(item=>`<div class="wp-timeline-row"><div class="wp-timeline-date">${dateMarkup(item.at,['event','vendor'].includes(item.kind))}</div><span class="wp-timeline-dot" aria-hidden="true">${item.status==='done'?'✓':item.kind==='milestone'?'◇':'○'}</span><div class="wp-timeline-content"><button class="wp-title-link" data-wp-action="edit-${item.kind}" data-id="${item.id}">${esc(taskName(item))}</button><small>${esc(ownerName(item.ownerUserId))}${ui.dashboard.dependencies.some(e=>e.successor_id===item.id)?' · ↳ '+tr('tasks'):''}</small></div>${badge(item.status)}</div>`).join('')||empty())}${pager('tasks')}${pager('milestones')}${pager('events')}${pager('vendor-assignments')}`;
  }
  function calendarItems() {return [...data('tasks').map(t=>({...t,kind:'task',at:t.dueAt})),...data('events').map(e=>({...e,kind:'event',at:e.startAt})),...data('milestones').map(m=>({...m,kind:'milestone',at:m.dueAt})),...data('vendor-assignments').filter(v=>v.arrivalAt).map(v=>({...v,title:v.name,kind:'vendor',at:v.arrivalAt}))];}
  function calendarRange() {
    const view=ui.calendarView||'month';
    const first=new Date((view==='month'?ui.month+'-01':ui.calendarAnchor)+'T12:00:00Z');
    if(view==='week')first.setUTCDate(first.getUTCDate()-(first.getUTCDay()+6)%7);
    const last=new Date(first);
    if(view==='month'){last.setUTCMonth(last.getUTCMonth()+1);last.setUTCDate(0);}
    if(view==='week')last.setUTCDate(last.getUTCDate()+6);
    return {from:first.toISOString().slice(0,10),to:last.toISOString().slice(0,10)};
  }
  function renderCalendar() {
    const first=new Date(ui.month+'-01T12:00:00Z'),offset=(first.getUTCDay()+6)%7;
    const start=new Date(first);start.setUTCDate(1-offset);
    const items=calendarItems();
    const days=Array.from({length:42},(_,i)=>{const day=new Date(start);day.setUTCDate(day.getUTCDate()+i);const iso=day.toISOString().slice(0,10);const records=items.filter(item=>item.at&&isoDay(item.at)===iso);return `<div class="wp-calendar-cell ${iso.slice(0,7)!==ui.month?'wp-outside':''} ${iso===isoDay(new Date().toISOString())?'wp-today':''}"><button class="wp-calendar-date" data-wp-action="calendar-day" data-id="${iso}" aria-label="${esc(dateText(iso))}">${ui.project.calendarPreference==='ethiopian'?new Intl.DateTimeFormat(lang()==='am'?'am-ET':'en',{calendar:'ethiopic',day:'numeric',timeZone:'UTC'}).format(day):day.getUTCDate()}</button>${records.slice(0,3).map(item=>`<button class="wp-calendar-item wp-kind-${item.kind}" title="${esc(taskName(item))}" data-wp-action="edit-${item.kind}" data-id="${item.id}">${item.kind==='event'?esc(timeText(item.startAt))+' ':''}${esc(taskName(item))}</button>`).join('')}${records.length>3?`<button class="wp-calendar-overflow" data-wp-action="calendar-day" data-id="${iso}">+${records.length-3}</button>`:''}</div>`;}).join('');
    const view=ui.calendarView||'month',range=calendarRange();
    const agenda=view==='month'?'':`<div class="wp-agenda ${view==='week'?'wp-agenda-week':''}">${Array.from({length:view==='week'?7:1},(_,i)=>{const day=new Date(range.from+'T12:00:00Z');day.setUTCDate(day.getUTCDate()+i);const iso=day.toISOString().slice(0,10),records=items.filter(item=>item.at&&isoDay(item.at)===iso).sort((a,b)=>a.at.localeCompare(b.at));return `<section class="wp-card"><h3>${esc(dateText(iso))}</h3>${records.map(item=>`<div class="wp-agenda-item"><small>${esc(timeText(item.at))} · ${esc(label(item.status))}</small><button type="button" class="wp-title-link" data-wp-action="edit-${item.kind}" data-id="${item.id}">${esc(taskName(item))}</button></div>`).join('')||'<p class="wp-caption">—</p>'}</section>`;}).join('')}</div>`;
    return `<div class="wp-toolbar"><div class="wp-actions">${button('month-prev','←','',false,`aria-label="Previous period"`)}<h2>${esc(dateText(view==='month'?ui.month+'-01':range.from))}</h2>${button('month-next','→','',false,`aria-label="Next period"`)}</div><div class="wp-actions">${['month','week','day'].map(v=>button('calendar-view',say(({month:'Month',week:'Week',day:'Day'})[v],({month:'ወር',week:'ሳምንት',day:'ቀን'})[v]),v,view===v,`aria-pressed="${view===v}"`)).join('')}</div><span class="wp-toolbar-spacer"></span>${permissions().edit?button('new-event','+ '+tr('add'),'',true):''}</div><p class="wp-caption">${tr('calendarHint')} · ${tr('localTime')}${ui.project.calendarPreference==='ethiopian'?` · ISO: ${range.from} – ${range.to}`:''}</p>${view==='month'?`<div class="wp-calendar"><div class="wp-calendar-weekdays">${Array.from({length:7},(_,i)=>`<span>${new Intl.DateTimeFormat(lang()==='am'?'am-ET':'en-GB',{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,0,5+i)))}</span>`).join('')}</div><div class="wp-calendar-grid">${days}</div></div>`:agenda}${pager('tasks')}${pager('events')}${pager('milestones')}${pager('vendor-assignments')}`;
  }
  function renderVendors() {
    const vendors=[...data('vendor-assignments')].sort((a,b)=>(a.serviceId||'').localeCompare(b.serviceId||'')||a.quotedMinor-b.quotedMinor);
    return `${toolbar('vendors')}<div class="wp-vendor-grid">${vendors.map(v=>`<article class="wp-card"><div class="wp-card-head"><span class="wp-category-label">${esc(serviceName(ui.dashboard.services.find(s=>s.id===v.serviceId)||{name:v.category||tr('vendor')}))}</span>${badge(v.status)}</div><h2>${esc(v.name)}</h2><p>${esc(v.contactName||'')}${v.phone?' · '+esc(v.phone):''}</p>${v.email?`<p class="wp-muted">${esc(v.email)}</p>`:''}${permissions().finance?`<dl class="wp-definition"><div><dt>${esc(label('quoted'))}</dt><dd>${money(v.quotedMinor)}</dd></div><div><dt>${tr('committed')}</dt><dd>${money(v.contractedMinor)}</dd></div></dl>`:''}<p class="wp-caption">${v.bookedDate?dateMarkup(v.bookedDate):tr('noDate')}${v.arrivalAt?' · '+timeText(v.arrivalAt):''}</p>${permissions().edit?button('edit-vendor',tr('edit'),v.id):''}</article>`).join('')}</div>${vendors.length?'':empty()}${pager('vendor-assignments')}`;
  }
  function table(headers,rows) {return `<div class="wp-table-wrap"><table class="wp-table"><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}
  function renderBudget() {
    const d=ui.dashboard;
    const lines=data('budget-lines');
    const lineRows=lines.map(line=>`<tr><th scope="row">${esc(line.label)}</th>${permissions().finance?`<td>${money(line.estimatedMinor)}</td><td>${money(line.committedMinor)}</td><td>${money(line.actualMinor)}</td>`:`<td>${money(line.clientAmountMinor)}</td>`}<td>${permissions().finance?button('edit-budget',tr('edit'),line.id):''}</td></tr>`);
    const paymentRows=data('payment-milestones').map(p=>`<tr><th scope="row">${esc(p.label)}</th><td>${money(p.amountMinor)}</td><td>${dateMarkup(p.dueOn)}</td><td>${badge(p.status)}</td><td>${p.status==='paid'?esc(p.externalTransactionId||''):button('edit-payment',p.status==='pending'?tr('reconcile'):tr('edit'),p.id)}</td></tr>`);
    return `${d.budget?stats([[tr('totalBudget'),money(d.budget.budgetMinor)],[tr('committed'),money(d.budget.committedMinor)],[tr('paid'),money(d.budget.paidMinor)],[tr('remaining'),money(d.budget.remainingMinor)]]):''}<p class="wp-muted">${tr('financeHint')}</p>${section(tr('budget'),lines.length?table([tr('title'),...(permissions().finance?[tr('estimated'),tr('committed'),tr('actual')]:[tr('agreed')]),''],lineRows):empty(),permissions().finance?button('new-budget','+ '+tr('add'),'',true):'')}${pager('budget-lines')}${permissions().finance?section(tr('payments'),paymentRows.length?table([tr('title'),tr('amount'),tr('date'),tr('status'),''],paymentRows):empty(),button('new-payment','+ '+tr('add')))+pager('payment-milestones'):''}`;
  }
  function renderGuests() {
    const summary=ui.dashboard.guestSummary;
    const rows=data('guests').map(g=>`<tr><th scope="row">${esc(g.displayName)}<small>${esc(g.household||'')}</small></th><td>${g.partySize}</td><td>${badge(g.rsvpStatus)}</td><td>${esc(g.table||'—')}</td><td>${esc(g.dietarySummary||'—')}</td><td>${permissions().edit?button('edit-guest',tr('edit'),g.id):''}</td></tr>`);
    return `${stats([[tr('invited'),summary.invited],[tr('accepted'),summary.accepted],[tr('pending'),summary.pending],[tr('guestsEstimate'),ui.project.guestEstimate]])}${toolbar('guests')}${section(tr('guests'),rows.length?table([tr('name'),tr('guests'),tr('status'),tr('table'),lang()==='am'?'ምግብ':'Dietary summary',''],rows):empty())}${pager('guests')}`;
  }
  function documentCards(documents) {
    return documents.length?`<div class="wp-document-grid">${documents.map(d=>`<article class="wp-card"><div class="wp-card-head">${badge(d.status)}<span class="wp-caption">${tr('revision')} ${d.revision||0}</span></div><h3>${esc(d.title)}</h3><p class="wp-muted">${tr(d.visibility==='internal'?'internal':d.visibility==='shared'?'shared':d.visibility==='client'?'client':d.visibility)} · ${dateMarkup(d.dueAt)}</p><div class="wp-actions">${button('document',tr('history'),d.id)}${button('upload',tr('upload'),d.id)}${d.status==='under_review'?button('review-document',tr('review'),d.id,true):''}</div></article>`).join('')}</div>`:empty();
  }
  function renderDocuments() {return `${toolbar('documents')}${documentCards(data('document-requests'))}${pager('document-requests')}`;}
  function renderBoards() {
    return `${toolbar('boards')}<div class="wp-board-grid">${data('design-boards').map(board=>`<article class="wp-card"><div class="wp-palette" aria-label="${esc(board.palette||'')}">${String(board.palette||'#f5f1ea,#c4ad92,#355650').split(',').filter(c=>/^#[a-fA-F0-9]{6}$/.test(c.trim())).slice(0,8).map(c=>`<span style="background-color:${c.trim()}" title="${c.trim()}"></span>`).join('')}</div><h2>${esc(board.title)}</h2><p class="wp-preline">${esc(board.notes||'')}</p><div class="wp-actions">${permissions().configure?button('edit-board',tr('edit'),board.id):''}${board.documentRequestId?button('document',tr('history'),board.documentRequestId):''}</div></article>`).join('')}</div>${data('design-boards').length?'':empty()}${pager('design-boards')}`;
  }
  function renderDay() {
    const events=data('events').filter(e=>e.eventType==='run_sheet').sort((a,b)=>a.startAt.localeCompare(b.startAt));
    const issues=data('issues').filter(i=>i.status!=='resolved');
    return `<div class="wp-toolbar"><div><h2>${tr('runSheet')}</h2><p class="wp-caption">${tr('localTime')}</p></div><span class="wp-toolbar-spacer"></span>${button('refresh-day',tr('refresh'))}${button('export',tr('export'))}${button('print',tr('print'))}</div><div class="wp-overview-grid"><div>${section(tr('day'),events.length?events.map(e=>`<div class="wp-run-row"><div class="wp-run-time"><strong>${esc(timeText(e.startAt))}</strong><small>${Math.round((new Date(e.endAt)-new Date(e.startAt))/60000)} min</small></div><div class="wp-task-main"><strong>${esc(e.title)}</strong><p>${esc(e.cue||'')}</p><small>${esc(ownerName(e.ownerUserId))} · ${esc(e.location||'')}</small>${e.backupOwnerUserId?`<small>↳ ${esc(ownerName(e.backupOwnerUserId))}</small>`:''}</div><div class="wp-task-meta">${badge(e.status)}${permissions().edit?button('edit-event',tr('edit'),e.id):''}</div></div>`).join(''):empty(),permissions().edit?button('new-cue','+ '+tr('add'),'',true):'')}${section(tr('arrival'),data('vendor-assignments').length?data('vendor-assignments').map(v=>`<div class="wp-arrival"><div><strong>${esc(v.name)}</strong><small>${esc(v.phone||'')} · ${v.arrivalAt?timeText(v.arrivalAt):'—'}</small></div>${v.arrivedAt?badge('confirmed'):permissions().edit?button('arrived',tr('arrived'),v.id):badge(v.status)}</div>`).join(''):empty())}</div><div>${section(tr('incidents'),issues.length?issues.map(issue=>`<div class="wp-incident"><div class="wp-card-head"><span class="wp-risk">${esc(label(issue.severity))}</span>${badge(issue.status)}</div><h3>${esc(issue.title)}</h3><p>${esc(issue.action||'')}</p><p class="wp-caption">${esc(ownerName(issue.ownerUserId))}</p>${permissions().edit?button('edit-issue',tr('edit'),issue.id):''}</div>`).join(''):empty(),permissions().edit?button('new-issue','+ '+tr('add')):'')}</div></div>${pager('events')}${pager('issues')}${pager('vendor-assignments')}`;
  }
  function activityRows(rows) {
    return rows.length?`<div class="wp-activity">${rows.map(row=>`<article><span class="wp-activity-dot" aria-hidden="true"></span><div><strong>${esc(label(row.action))}</strong><p>${esc(row.after?.title||row.after?.name||row.after?.label||label(row.collection))} · ${esc(ownerName(row.actorUserId))}</p><small>${dateMarkup(row.createdAt,true)}</small>${permissions().configure&&row.after?`<details><summary>${tr('edit')}</summary><pre>${esc(JSON.stringify({before:row.before,after:row.after},null,2))}</pre></details>`:''}</div></article>`).join('')}</div>`:empty();
  }
  function renderActivity() {
    return `${section(tr('reminders'),`<div class="wp-actions">${permissions().configure?button('generate-reminders',tr('generate')):''}${button('preferences',tr('settings'))}</div>${data('notifications').length?data('notifications').map(n=>`<div class="wp-task-row"><div class="wp-task-main"><strong>${esc(n.title)}</strong><small>${dateMarkup(n.scheduledAt,true)}</small></div>${badge(n.status)}${n.status!=='delivered'?button('acknowledge',tr('acknowledge'),n.id):''}</div>`).join(''):empty()}`)}${section(tr('activity'),activityRows(data('activity')))}${pager('activity')}${pager('notifications')}`;
  }

  let dialog,restoreFocus;
  function modal(title,content,footer='',wide=false) {
    if (!dialog) {
      dialog=document.createElement('dialog');dialog.id='wpDialog';dialog.className='wp-dialog';document.body.append(dialog);
      dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
      dialog.addEventListener('close',()=>{ui.service=null;if(restoreFocus?.isConnected)restoreFocus.focus();else root.querySelector('h1')?.focus({preventScroll:true});});
    }
    if(!dialog.open)restoreFocus=document.activeElement;
    dialog.classList.toggle('wp-dialog-wide',wide);
    dialog.innerHTML=`<div class="wp-dialog-head"><h2 id="wpDialogTitle">${esc(title)}</h2><button type="button" class="wp-icon-btn" data-wp-action="close" aria-label="${tr('close')}">×</button></div><div class="wp-dialog-content">${content}<div class="wp-form-error" id="wpFormError" role="alert" hidden></div></div>${footer?`<div class="wp-dialog-footer">${footer}</div>`:''}`;
    dialog.setAttribute('aria-labelledby','wpDialogTitle');
    if(!dialog.open)dialog.showModal();
    const target=dialog.querySelector('[autofocus],input:not([type=checkbox]),select,textarea');
    if(target)target.focus({preventScroll:true});
  }
  function formError(error) {
    const box=document.getElementById('wpFormError');
    if(!box){toast(error.message);return;}
    box.hidden=false;
    const latest=error.data?.latest;
    const labels={title:'title',name:'name',status:'status',ownerUserId:'owner',dueAt:'deadline',amountMinor:'amount',estimatedMinor:'estimated',committedMinor:'committed',actualMinor:'actual',budgetMinor:'totalBudget',required:'required',clientAmountMinor:'agreed'};
    const display=(key,value)=>key.endsWith('Minor')?money(value):key.endsWith('At')?dateText(value,true):key==='ownerUserId'?ownerName(value):key==='status'?label(value):String(value??'—');
    box.innerHTML=`<strong>${esc(error.message)}</strong>${error.data?.outstanding?`<p>${esc(Object.entries(error.data.outstanding).map(([k,v])=>`${tr(k)}: ${v}`).join(' · '))}</p>`:''}${latest?`<p>${tr('status')}: ${esc(label(latest.status))} · v${latest.version}</p>${error.data.changedFields?.length?`<ul>${error.data.changedFields.map(key=>`<li>${esc(labels[key]?tr(labels[key]):label(key).replace(/([a-z])([A-Z])/g,'$1 $2'))}: ${esc(display(key,latest[key]))}</li>`).join('')}</ul>`:''}${button('reload',tr('reload'))}`:''}`;
    box.scrollIntoView({block:'nearest'});
  }
  function field(name,title,type='text',value='',options=[],required=false,hint='') {
    const id='wp-'+name;
    const attrs=`id="${id}" name="${esc(name)}" data-wp-field="${esc(name)}" data-type="${type}" ${required?'required':''}`;
    let control;
    if(type==='checkbox')return `<label class="wp-check"><input ${attrs} type="checkbox" ${value?'checked':''}><span>${esc(title)}</span></label>`;
    if(type==='select')control=`<select ${attrs}>${options.map(option=>{const [v,text]=Array.isArray(option)?option:[option,label(option)];return `<option value="${esc(v)}" ${String(value??'')===String(v)?'selected':''}>${esc(text)}</option>`;}).join('')}</select>`;
    else if(type==='textarea'||type==='json')control=`<textarea ${attrs} rows="${type==='json'?8:3}" ${type==='json'?'spellcheck="false"':''}>${esc(value)}</textarea>`;
    else control=`<input ${attrs} type="${type==='money'?'text':type==='integer'?'number':type}" ${type==='money'?'inputmode="decimal"':type==='integer'?'min="0" step="1"':''} value="${esc(value)}" ${type==='text'?'maxlength="400"':''}>`;
    return `<div class="wp-field ${['textarea','json'].includes(type)?'wp-full':''}"><label for="${id}">${esc(title)}${required?' <span aria-hidden="true">*</span>':''}</label>${control}${hint?`<small>${esc(hint)}</small>`:''}</div>`;
  }
  function formValues(container=dialog) {
    const values={};
    container.querySelectorAll('[data-wp-field]').forEach(input=>{
      let value=input.value;
      if(input.dataset.type==='checkbox')value=input.checked;
      else if(input.dataset.type==='money')value=toMinor(value||'0');
      else if(input.dataset.type==='integer'){if(value==='')value='0';if(!/^\d+$/.test(value))throw new Error('Enter a whole number.');value=Number(value);}
      else if(input.dataset.type==='datetime-local')value=value?new Date(value+':00+03:00').toISOString():null;
      else if(input.dataset.type==='json')value=JSON.parse(value);
      values[input.dataset.wpField]=value;
    });
    return values;
  }
  const say=(en,am)=>lang()==='am'?am:en;
  const statusOptions={tasks:['todo','in_progress','blocked','done','cancelled'],vendors:['shortlisted','quoted','selected','contracted','confirmed','delivered','closed','rejected','cancelled'],documents:['requested','under_review','approved','changes_requested','rejected']};
  const bookingNext={shortlisted:['quoted','rejected','cancelled'],quoted:['selected','rejected','cancelled'],selected:['contracted','cancelled'],contracted:['confirmed','cancelled'],confirmed:['delivered','cancelled'],delivered:['closed'],closed:[],rejected:['shortlisted'],cancelled:[]};
  const serviceNext={not_started:['in_progress','awaiting_approval','cancelled','not_applicable'],in_progress:['awaiting_approval','cancelled','not_applicable'],awaiting_approval:['in_progress','cancelled','not_applicable'],confirmed:['in_progress','cancelled','not_applicable'],completed:[],cancelled:['not_started'],not_applicable:['not_started']};
  const names={tasks:'tasks',services:'services',milestones:'milestones',events:'calendar','vendor-assignments':'vendors','budget-lines':'budget','payment-milestones':'payments','document-requests':'documents',guests:'guests',issues:'issue','design-boards':'boards',notes:'notes'};
  function editorSchema(collection,item,existing) {
    const svc=[['',tr('any')],...ui.dashboard.services.map(s=>[s.id,serviceName(s)])];
    const members=[['',tr('unassigned')],...ui.members.map(m=>[m.userId,m.name])];
    const files=[['',say('No file linked','ፋይል አልተገናኘም')],...ui.files.map(f=>[f.id,`${f.filename} · ${tr('revision')} ${f.revision}`])];
    const visibility=['internal','shared','client','vendor','church'].map(v=>[v,tr(v)]);
    const serviceField=['serviceId',tr('service'),'select',svc];
    const ownerField=['ownerUserId',tr('owner'),'select',members];
    const visibilityField=['visibility',tr('visibility'),'select',visibility];
    const reasonField=['reason',tr('reason'),'textarea',[],['budget-lines','payment-milestones'].includes(collection)&&existing];
    const schemas={
      services:[['name',tr('name'),'text',[],true],['nameAm',say('Amharic name','የአማርኛ ስም')],['category',tr('category'),'select',['spiritual','atmosphere','people','hospitality','logistics'].map(c=>[c,tr(c)])],ownerField,['status',tr('status'),'select',existing?[item.status,...(serviceNext[item.status]||[])]:['not_started']],['enabled',tr('enabled'),'checkbox'],['blockerSummary',tr('blocked'),'textarea'],visibilityField,reasonField],
      tasks:[['title',tr('title'),'text',[],true],['description',tr('description'),'textarea'],serviceField,ownerField,['status',tr('status'),'select',statusOptions.tasks],['priority',tr('priority'),'select',['low','normal','high','critical']],['dueAt',tr('deadline'),'datetime-local'],['required',tr('required'),'checkbox'],['approvalRequired',say('Requires an approved document','የጸደቀ ሰነድ ያስፈልጋል'),'checkbox'],['proofFileId',say('Completion file','የማጠናቀቂያ ፋይል'),'select',files],visibilityField,reasonField],
      milestones:[['title',tr('title'),'text',[],true],serviceField,ownerField,['dueAt',tr('deadline'),'datetime-local'],['status',tr('status'),'select',['todo','verified']],['required',tr('required'),'checkbox'],['evidence',tr('evidence'),'textarea'],visibilityField,reasonField],
      events:[['title',tr('title'),'text',[],true],['startAt',say('Start · Addis Ababa','መጀመሪያ · አዲስ አበባ'),'datetime-local',[],true],['endAt',say('End · Addis Ababa','መጨረሻ · አዲስ አበባ'),'datetime-local',[],true],['eventType',say('Event type','የቀጠሮ አይነት'),'select',['appointment','booking','run_sheet','rehearsal','milestone']],serviceField,ownerField,['backupOwnerUserId',say('Backup owner','ተጠባባቂ ኃላፊ'),'select',members],['location',say('Location','ቦታ')],['assetId',say('Venue / resource reference','የቦታ / መሣሪያ መለያ')],['vendorId',tr('vendor'),'select',[['',tr('unassigned')],...(ui.lookupVendors||[]).map(v=>[v.id,v.name])]],['status',tr('status'),'select',['not_started','underway','done','delayed','skipped']],['cue',say('Cue / instructions','መመሪያ'),'textarea'],['externalConfirmed',say('Externally confirmed reservation','ከአቅራቢው ጋር የተረጋገጠ ቦታ'),'checkbox'],visibilityField,['overrideReason',say('Conflict / reservation override reason','የግጭት / የቦታ ማስያዣ ለውጥ ምክንያት'),'textarea']],
      'vendor-assignments':[['name',tr('name'),'text',[],true],serviceField,['contactName',say('Contact person','የእውቂያ ሰው')],['phone',say('Phone','ስልክ'),'tel'],['email',say('Email','ኢሜይል'),'email'],['externalVendorId',say('Shared vendor reference','የአቅራቢ መለያ')],['locality',tr('city')],['status',tr('status'),'select',existing?[item.status,...(bookingNext[item.status]||[])]:['shortlisted']],...(permissions().finance?[['quotedMinor',say('Quote (ETB)','የቀረበ ዋጋ (ብር)'),'money'],['contractedMinor',say('Contract amount (ETB)','የውል መጠን (ብር)'),'money'],['contractFileId',say('Signed contract','የተፈረመ ውል'),'select',files]]:[]),['bookedDate',say('Confirmed booking date','የተረጋገጠ ቀን'),'date'],['arrivalAt',say('Arrival · Addis Ababa','መድረሻ · አዲስ አበባ'),'datetime-local'],['departureAt',say('Departure · Addis Ababa','መነሻ · አዲስ አበባ'),'datetime-local'],['backupContact',say('Backup contact','ተጠባባቂ አድራሻ')],visibilityField,reasonField],
      'budget-lines':[['label',tr('title'),'text',[],true],serviceField,['vendorAssignmentId',tr('vendor'),'select',[['',tr('unassigned')],...(ui.lookupVendors||[]).map(v=>[v.id,v.name])]],['estimatedMinor',tr('estimated')+' (ETB)','money'],['committedMinor',tr('committed')+' (ETB)','money'],['actualMinor',tr('actual')+' (ETB)','money'],['clientAmountMinor',tr('agreed')+' (ETB)','money'],visibilityField,reasonField],
      'payment-milestones':[['label',tr('title'),'text',[],true],['budgetLineId',tr('budget'),'select',[['',say('Choose a commitment','ግዴታ ይምረጡ')],...(ui.lookupLines||[]).map(line=>[line.id,`${line.label} · ${money(line.committedMinor)}`])],true],['amountMinor',tr('amount'),'money',[],true],['dueOn',tr('deadline'),'date'],['status',tr('status'),'select',existing?['pending','paid','failed','cancelled']:['pending']],['externalTransactionId',say('Existing transaction reference','የነባር ግብይት መለያ')],['receiptFileId',say('Receipt file','የደረሰኝ ፋይል'),'select',files],['evidence',say('Reconciliation note','የማረጋገጫ ማስታወሻ'),'textarea'],reasonField],
      'document-requests':[['title',tr('title'),'text',[],true],serviceField,['requestedFromUserId',say('Requested from','የተጠየቀው ከ'),'select',members],['dueAt',tr('deadline'),'datetime-local'],['reviewerRole',say('Required approver','የሚፈለግ አጽዳቂ'),'select',[['planner',tr('internal')],['couple',tr('client')],['church',tr('church')]]],['required',tr('required'),'checkbox'],visibilityField],
      guests:[['displayName',tr('name'),'text',[],true],['household',say('Household','ቤተሰብ')],['partySize',say('Party size','የቡድን ብዛት'),'integer'],['rsvpStatus',say('RSVP','የግብዣ ምላሽ'),'select',['pending','accepted','declined']],['table',tr('table')],['dietarySummary',say('Dietary summary (no medical details)','የምግብ ፍላጎት (የሕክምና ዝርዝር አያስፈልግም)')],visibilityField],
      issues:[['title',tr('title'),'text',[],true],serviceField,ownerField,['severity',say('Severity','ክብደት'),'select',['low','normal','high','critical']],['status',tr('status'),'select',['open','investigating','resolved']],['action',say('Action taken','የተወሰደ እርምጃ'),'textarea'],['resolution',say('Resolution','መፍትሄ'),'textarea'],visibilityField],
      'design-boards':[['title',tr('title'),'text',[],true],serviceField,['palette',say('Palette · comma-separated hex colors','ቀለሞች · በነጠላ ሰረዝ የተለዩ ኮዶች')],['notes',tr('notes'),'textarea'],['documentRequestId',tr('documents'),'select',[['',tr('any')],...(ui.lookupDocuments||[]).map(doc=>[doc.id,doc.title])]],visibilityField],
      notes:[['title',tr('title'),'text',[],true],serviceField,['notes',tr('notes'),'textarea'],visibilityField],
    };
    let schema=schemas[collection];
    if(!permissions().configure) {
      schema=schema.filter(([key])=>!['ownerUserId','visibility','required','approvalRequired'].includes(key));
      if(!permissions().edit&&collection==='tasks')schema=schema.filter(([key])=>['status','proofFileId','reason'].includes(key));
      if(!permissions().edit&&collection==='milestones')schema=schema.filter(([key])=>['status','evidence'].includes(key));
    }
    return schema;
  }
  async function openEditor(collection,id=null,seed={}) {
    const returnService=ui.service?{id:ui.service.id,tab:ui.serviceTab}:null;
    const item=id?await api(base(collection+'/'+id)):{visibility:'internal',status:collection==='services'?'not_started':collection==='vendor-assignments'?'shortlisted':collection==='events'?'not_started':collection==='issues'?'open':'todo',enabled:true,required:collection==='tasks'||collection==='milestones',priority:'normal',ownerUserId:ui.cap.userId,partySize:1,rsvpStatus:'pending',reviewerRole:'planner',eventType:'appointment',...seed};
    const needsFiles=['tasks','vendor-assignments','payment-milestones'].includes(collection);
    const needsVendors=['events','budget-lines'].includes(collection);
    const requests=[needsFiles?api(base('files')).then(r=>{ui.files=r.items;}):Promise.resolve(),needsVendors?api(base('vendor-assignments')+'?limit=100').then(r=>{ui.lookupVendors=r.items;}):Promise.resolve(),collection==='payment-milestones'?api(base('budget-lines')+'?limit=100').then(r=>{ui.lookupLines=r.items;}):Promise.resolve(),collection==='design-boards'?api(base('document-requests')+'?limit=100').then(r=>{ui.lookupDocuments=r.items;}):Promise.resolve()];
    await Promise.all(requests);
    if(collection==='events'&&!id){item.startAt ||= new Date(Date.now()+3600000).toISOString();item.endAt ||= new Date(Date.now()+7200000).toISOString();}
    const schema=editorSchema(collection,item,!!id);
    const fields=schema.map(([key,title,type='text',options=[],required=false])=>field(key,title,type,type==='money'?amountValue(item[key]):type==='datetime-local'?localInput(item[key]):item[key]??'',options,required)).join('');
    let extras='';
    if(collection==='tasks'&&id&&permissions().configure)extras=`<div class="wp-form-section"><h3>${say('Prerequisites','ቅድመ መስፈርቶች')}</h3><p class="wp-caption">${say('Complete the predecessor before completing this task.','ይህ ተግባር ከመጠናቀቁ በፊት ቅድመ ተግባሩን ያጠናቅቁ።')}</p>${button('dependencies',tr('edit'),id)}</div>`;
    ui.editing={collection,item:id?item:null,returnService,previewToken:null};
    modal(`${id?tr('edit'):tr('add')} · ${tr(names[collection])}`,`<form id="wpResourceForm"><div class="wp-form-grid">${fields}</div><div id="wpImpactPreview"></div>${extras}</form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpResourceForm">${tr('save')}</button>`,true);
  }
  function impactMarkup(preview) {
    const warnings=preview.warnings||preview.dependencyWarnings||[];
    const external=preview.externalReservations||[];
    return `<div class="wp-preview"><h3>${tr('preview')}</h3>${preview.shifts?`<p>${preview.shifts.length} ${tr('tasks').toLowerCase()} · ${preview.overdueBaseline} ${tr('overdue').toLowerCase()}</p>`:`<p>${dateMarkup(preview.before,true)} → ${dateMarkup(preview.after,true)}</p>`}${warnings.length?`<ul>${warnings.map(w=>`<li>${esc(w.title||w.predecessor||'')} · ${esc(w.message)}</li>`).join('')}</ul>`:''}${external.length?`<p><strong>${tr('reservations')}</strong></p><ul>${external.map(e=>`<li>${esc(e.title)} · ${dateMarkup(e.bookedDate,true)}</li>`).join('')}</ul>`:''}${preview.shifts?`<div class="wp-preview-list">${preview.shifts.map(s=>`<div><strong>${esc(s.title)}</strong><span>${dateMarkup(s.before)} → ${dateMarkup(s.after)}</span></div>`).join('')}</div>`:''}${preview.manualDeadlines?.length?`<p>${preview.manualDeadlines.length} ${say('manual deadlines remain unchanged.','በእጅ የተመረጡ ቀናት አይቀየሩም።')}</p>`:''}<p class="wp-caption">${say('Review this impact, then select Save to confirm.','ተፅዕኖውን ይገምግሙ እና ለማረጋገጥ አስቀምጥ ይምረጡ።')}</p></div>`;
  }
  async function saveResource() {
    const {collection,item,returnService}=ui.editing;
    const body=formValues(document.getElementById('wpResourceForm'));
    if(item)body.version=item.version;
    if(collection==='tasks'&&item&&body.dueAt!==undefined&&new Date(body.dueAt||0).getTime()!==new Date(item.dueAt||0).getTime()) {
      const preview=await api(base(`tasks/${item.id}/schedule-preview`),'POST',{dueAt:body.dueAt});
      if(ui.editing.previewToken!==preview.previewToken) {
        ui.editing.previewToken=preview.previewToken;
        document.getElementById('wpImpactPreview').innerHTML=impactMarkup(preview);
        return;
      }
      body.previewToken=preview.previewToken;
    }
    if(collection==='events') {
      const candidate={...body};delete candidate.version;
      const check=await api(base('events/conflict-check'),'POST',candidate);
      const relevant=check.conflicts.filter(c=>c.eventId!==item?.id);
      if(relevant.length&&!body.overrideReason) {
        document.getElementById('wpImpactPreview').innerHTML=`<div class="wp-preview"><h3>${say('Scheduling conflicts','የጊዜ ግጭቶች')}</h3><ul>${relevant.map(c=>`<li>${esc(c.title)} · ${dateMarkup(c.startAt,true)}</li>`).join('')}</ul><p>${say('Record an override reason before saving an intentional overlap.','ለታሰበ የጊዜ መደራረብ ምክንያቱን ይጻፉ።')}</p></div>`;
        return;
      }
    }
    await api(base(collection+(item?'/'+item.id:'')),item?'PATCH':'POST',body);
    dialog.close();toast(tr('saved'));await loadRoute();
    if(returnService)await openService(returnService.id,returnService.tab);
  }
  async function openService(id,tab='Plan') {
    const service=await api(base('services/'+id));
    ui.service=service;ui.serviceTab=tab;
    const tabs=['Plan','Tasks','Schedule','Vendor','Budget','Files & Approvals','Notes'];
    const tabLabels={Plan:tr('overview'),Tasks:tr('tasks'),Schedule:tr('calendar'),Vendor:tr('vendors'),Budget:tr('budget'),'Files & Approvals':tr('documents'),Notes:tr('notes')};
    let content='';
    if(tab==='Plan')content=`<dl class="wp-definition"><div><dt>${tr('owner')}</dt><dd>${esc(ownerName(service.ownerUserId))}</dd></div><div><dt>${tr('deadline')}</dt><dd>${dateMarkup(service.targetDate)}</dd></div><div><dt>${tr('status')}</dt><dd>${badge(service.blockerSummary?'blocked':service.status)}</dd></div></dl>${service.templateSnapshot?.evidence?`<div class="wp-callout"><p>${esc(service.templateSnapshot.evidence)}</p></div>`:''}${service.blockerSummary?`<p class="wp-risk">${esc(service.blockerSummary)}</p>`:''}${service.aftercare?`<p class="wp-caption">${tr('aftercareHint')}</p>`:''}<div class="wp-actions">${permissions().configure?button('edit-service',tr('edit'),id):''}${permissions().edit||permissions().verifyChurch?button('verify-service',tr('confirm'),id,true):''}${service.status==='confirmed'?button('complete-service',tr('complete'),id):''}${permissions().roles.includes('admin')&&service.availableTemplateVersion>service.templateSnapshot?.templateVersion?button('upgrade-template',say('Preview template update','የአብነት ለውጥን ይመልከቱ'),id):''}</div>`;
    if(tab==='Tasks')content=service.tasks.map(taskRow).join('')||empty();
    if(tab==='Schedule') {
      const response=await api(base('events')+'?serviceId='+id+'&limit=100');
      content=response.items.map(e=>`<div class="wp-task-row"><div class="wp-task-main"><strong>${esc(e.title)}</strong><small>${dateMarkup(e.startAt,true)}</small></div>${badge(e.status)}${permissions().edit?button('edit-event',tr('edit'),e.id):''}</div>`).join('')||empty();
    }
    if(tab==='Vendor') {
      const response=await api(base('vendor-assignments')+'?serviceId='+id+'&limit=100');
      content=response.items.map(v=>`<div class="wp-task-row"><div class="wp-task-main"><strong>${esc(v.name)}</strong><small>${esc(v.phone||'')}</small></div>${badge(v.status)}${permissions().finance?`<strong>${money(v.quotedMinor)}</strong>`:''}${permissions().edit?button('edit-vendor',tr('edit'),v.id):''}</div>`).join('')||empty();
    }
    if(tab==='Budget') {
      const response=await api(base('budget-lines')+'?serviceId='+id+'&limit=100');
      content=response.items.map(b=>`<div class="wp-task-row"><strong class="wp-task-main">${esc(b.label)}</strong><strong>${money(permissions().finance?b.committedMinor:b.clientAmountMinor)}</strong>${permissions().finance?button('edit-budget',tr('edit'),b.id):''}</div>`).join('')||empty();
    }
    if(tab==='Files & Approvals')content=documentCards((await api(base('document-requests')+'?serviceId='+id+'&limit=100')).items);
    if(tab==='Notes')content=(await api(base('notes')+'?serviceId='+id+'&limit=100')).items.map(note=>`<article class="wp-note"><h3>${esc(note.title)}</h3><p class="wp-preline">${esc(note.notes||'')}</p></article>`).join('')||empty();
    const adds={Tasks:'new-task',Schedule:'new-event',Vendor:'new-vendor',Budget:'new-budget','Files & Approvals':'new-document',Notes:'new-note'};
    if(tab==='Plan'&&permissions().configure&&ui.cap.canAccessClients&&ui.project.clientId&&service.questionnaireSettings) {
      const settings=service.questionnaireSettings;
      content+=`<div class="wp-callout"><div><strong>${tr('serviceDetails')}</strong><p>${esc(settings.notes||say('Arrange preferences, quantities and service notes here.','ምርጫዎችን፣ ብዛቶችን እና ማስታወሻዎችን እዚህ ያዘጋጁ።'))}</p></div>${button('service-details',tr('edit'),id)}</div>`;
    }
    modal(serviceName(service),`<div class="wp-service-dialog-meta">${badge(service.status)}<span>${tr(service.category)}</span>${service.aftercare?`<span>${tr('aftercare')}</span>`:''}</div><nav class="wp-tabs" aria-label="${tr('service')}">${tabs.map(t=>`<button data-wp-action="service-tab" data-id="${esc(t)}" class="${t===tab?'is-active':''}" ${t===tab?'aria-current="page"':''}>${tabLabels[t]}</button>`).join('')}</nav>${content}`,`${adds[tab]&&permissions().edit&&(tab!=='Budget'||permissions().finance)?button(adds[tab],'+ '+tr('add'),id,true):''}${button('close',tr('close'))}`,true);
  }
  const weddingFields=['title','clientId','weddingDate','guestEstimate','budgetMinor','language','calendarPreference','city','churchLocation','venueLocation','package','selectedServiceCodes','ceremonyType','timezone','currency'];
  async function startWizard(existing=false) {
    const [templates,clients]=await Promise.all([api('service-templates'),ui.cap.canAccessClients?api('weddings/clients'):Promise.resolve({items:[]})]);
    ui.templates=templates.items;ui.clients=clients.items;
    ui.wizard=existing?{...ui.project}:{title:'',clientId:null,weddingDate:null,guestEstimate:0,budgetMinor:0,language:lang(),calendarPreference:'ethiopian',city:'Addis Ababa',churchLocation:'',venueLocation:'',ceremonyType:'church',timezone:'Africa/Addis_Ababa',currency:'ETB',package:'full_planning',selectedServiceCodes:templates.items.filter(t=>t.defaultEnabled).map(t=>t.code)};
    ui.clientSource=ui.wizard.clientId?await api('weddings/clients/'+ui.wizard.clientId):null;
    ui.wizardStep=0;renderWizard();
  }
  async function continueQuestionnaire() {
    if(ui.handoffBusy)return;
    syncDetailsFromForm();clearValidation();
    const errors=['brideName','groomName'].filter(key=>!state.details[key]?.trim()).map(id=>({id,message:t('nameRequired')}));
    if(errors.length){showValidation(errors,0);return;}
    if(!selectedServices().length){showValidation([{message:t('noServicesWarning')}],1);return;}
    ui.handoffBusy=true;
    const controls=[...document.querySelectorAll('[data-continue-planning], #weddingPlanningNav')];controls.forEach(b=>b.disabled=true);
    try {
      const saved=await saveRecord({silent:true,requireRemote:true});
      if(saved)await questionnaireHandoff(`weddings/clients/${saved.id}/plan`);
    } finally {ui.handoffBusy=false;controls.forEach(b=>b.disabled=false);}
  }
  async function questionnaireHandoff(path,body={}) {
    try {
      const wedding=await api(path,'POST',body);
      dialog?.close();ui.service=null;ui.questionnairePending=null;
      toast(tr('saved'));go(wedding.id);
    } catch(error) {
      const preview=error.data?.questionnairePreview;
      if(!preview)throw error;
      showQuestionnairePreview(path,body,preview);
    }
  }
  function showQuestionnairePreview(path,body,preview) {
      ui.questionnairePending={path,body,preview};
      const fields={title:'weddingTitle',weddingDate:'date',guestEstimate:'guestsEstimate',churchLocation:'churchLocation',venueLocation:'venueLocation',package:'package',language:'language'};
      const conflicts=preview.conflicts.map(c=>field(c.field,tr(fields[c.field]||c.field),'select','planner',[
        ['planner',`${say('Keep planner','የዕቅዱን አስቀምጥ')}: ${c.planner??'—'}`],
        ['questionnaire',`${tr('questionnaire')}: ${c.questionnaire??'—'}`],
      ])).join('');
      modal(say('Update the connected plan','የተገናኘውን ዕቅድ አድስ'),`<p>${esc(preview.title)}</p>${preview.dateImpact?impactMarkup(preview.dateImpact):''}${conflicts?`<p>${say('These fields changed in both places. Choose the values to keep.','እነዚህ መስኮች በሁለቱም ቦታ ተቀይረዋል። የሚቀመጡትን ይምረጡ።')}</p>`:''}<form id="wpQuestionnaireSyncForm"><div class="wp-form-grid">${conflicts}</div></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpQuestionnaireSyncForm">${tr('save')}</button>`,true);
  }
  async function openQuestionnaire(step=0,id=ui.project?.clientId) {
    if(!id)return linkQuestionnaireDialog();
    dialog?.close();
    const opened=await openRecord(Number(id),{step:step>=2?0:step});
    if(opened&&step>=2&&(step===2?validateBeforeAgreement():validateBeforeProforma()))setStep(step);
  }
  async function linkQuestionnaireDialog() {
    const clients=await api('weddings/clients');
    modal(say('Link couple questionnaire','የጥንዶችን መጠይቅ አገናኝ'),`<p>${say('Bring the couple details and chosen services into this plan. Existing work is retained.','የጥንዶችን መረጃ እና የተመረጡ አገልግሎቶች ወደዚህ ዕቅድ ያምጡ። ነባር ሥራዎች ይቀመጣሉ።')}</p><form id="wpLinkQuestionnaireForm">${field('clientId',tr('questionnaire'),'select','',[['',say('Choose a couple','ጥንዶችን ይምረጡ')],...clients.items.map(c=>[c.id,c.title])],true)}</form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpLinkQuestionnaireForm">${tr('next')}</button>`);
  }
  async function serviceDetailsDialog() {
    const values=await api(base(`services/${ui.service.id}/questionnaire-details`));
    const definition=services.find(s=>s.id===values.legacyId);
    if(!definition)throw new Error('This service is unavailable in the questionnaire.');
    ui.serviceDetails={...values,definition,serviceId:ui.service.id};
    const fields=definition.options.map(option=>{
      const value=values.options[option.id]??(option.type==='multi'?[]:option.type==='toggle'?false:'');
      if(option.type==='multi')return `<fieldset class="wp-full"><legend>${esc(localized(option.label))}</legend><div class="wp-check-grid">${option.choices.map(choice=>`<label class="wp-check"><input type="checkbox" data-wp-detail-choice="${esc(option.id)}" value="${esc(choice.value)}" ${Array.isArray(value)&&value.includes(choice.value)?'checked':''}>${esc(localized(choice.label))}</label>`).join('')}</div></fieldset>`;
      return field('detail-'+option.id,localized(option.label),option.type==='single'?'select':option.type==='toggle'?'checkbox':option.type,value,option.type==='single'?[['',say('Choose later','በኋላ ይምረጡ')],...option.choices.map(c=>[c.value,localized(c.label)])]:[]);
    }).join('');
    modal(`${serviceName(ui.service)} · ${tr('serviceDetails')}`,`<p class="wp-caption">${say('These details also update the linked questionnaire and agreement.','እነዚህ ዝርዝሮች የተገናኘውን መጠይቅ እና ስምምነት ያዘምናሉ።')}</p><form id="wpServiceDetailsForm"><div class="wp-form-grid">${fields}${field('serviceNotes',tr('notes'),'textarea',values.notes)}</div></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpServiceDetailsForm">${tr('save')}</button>`,true);
  }
  function collectWizard() {
    const form=document.getElementById('wpWizardForm');
    if(!form)return true;
    if(!form.reportValidity())return false;
    const values=formValues(form);
    if('clientId'in values)values.clientId=values.clientId?Number(values.clientId):null;
    Object.assign(ui.wizard,values);
    if(ui.wizardStep===3)ui.wizard.selectedServiceCodes=[...form.querySelectorAll('[data-wp-service-code]:checked')].map(input=>input.dataset.wpServiceCode);
    return true;
  }
  function suggestedDate(template,offset=template.relativeOffsetDays) {
    if(!ui.wizard.weddingDate)return null;
    const d=new Date(ui.wizard.weddingDate+'T12:00:00Z');
    if(template.aftercare&&offset===180){const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+6);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));}
    else d.setUTCDate(d.getUTCDate()+offset);
    return d.toISOString().slice(0,10);
  }
  function renderWizard() {
    const w=ui.wizard,index=ui.wizardStep;
    const steps=['coupleStep','detailsStep','churchStep','packageStep','planStep','reviewStep'];
    const selected=ui.templates.filter(t=>w.selectedServiceCodes.includes(t.code));
    if(index===0&&w.clientId&&ui.clientSource) {
      const source=ui.clientSource;
      modal(tr('questionnaire'),`<form id="wpWizardForm">${field('clientId',tr('existingClient'),'select',w.clientId,[['',tr('noLink')],...ui.clients.map(c=>[c.id,c.title])])}</form><h3>${esc(source.fields.title)}</h3><p>${dateMarkup(source.fields.weddingDate)} · ${source.selectedServiceCodes.length} ${tr('services').toLocaleLowerCase()}</p><p>${say('Continue with the details and services already chosen in the questionnaire.','በመጠይቁ የተመረጡትን ዝርዝሮች እና አገልግሎቶች ይዘው ይቀጥሉ።')}</p>`,`${button('questionnaire-edit',tr('edit'),String(w.clientId))}${button('use-questionnaire',tr('continuePlanner'),String(w.clientId),true)}`);
      return;
    }
    let content='';
    if(index===0)content=field('clientId',tr('existingClient'),'select',w.clientId,[['',tr('noLink')],...ui.clients.map(c=>[c.id,c.title])])+field('title',tr('weddingTitle'),'text',w.title,[],true)+`<p class="wp-caption wp-full">${say('Choose a saved questionnaire to carry its details and service selection into the plan.','ዝርዝሮቹን እና የአገልግሎት ምርጫውን ወደ ዕቅዱ ለማምጣት የተቀመጠ መጠይቅ ይምረጡ።')}</p>`;
    if(index===1)content=field('weddingDate',tr('date'),'date',w.weddingDate)+field('guestEstimate',tr('guestsEstimate'),'integer',w.guestEstimate)+field('budgetMinor',tr('totalBudget'),'money',amountValue(w.budgetMinor))+field('city',tr('city'),'text',w.city)+field('language',tr('language'),'select',w.language,[['en','English'],['am','አማርኛ']])+field('calendarPreference',tr('calendarPreference'),'select',w.calendarPreference,[['gregorian',say('Gregorian','ጎርጎርዮስ')],['ethiopian',say('Ethiopian','ኢትዮጵያ')]])+`<p class="wp-caption wp-full">${tr('unscheduledHint')}</p>`;
    if(index===2)content=field('ceremonyType',tr('ceremonyType'),'select',w.ceremonyType,[['church',say('Church / Orthodox','ቤተ ክርስቲያን / ኦርቶዶክስ')],['other',say('Other ceremony','ሌላ ሥነ ሥርዓት')]])+field('churchLocation',tr('churchLocation'),'text',w.churchLocation)+field('venueLocation',tr('venueLocation'),'text',w.venueLocation)+`<div class="wp-callout wp-full"><p>${tr('clergyHint')}</p></div>`;
    if(index===3)content=field('package',tr('package'),'select',w.package,[['full_planning',say('Full planning','ሙሉ ዕቅድ')],['day_of',say('Day-of coordination','የሰርግ ቀን ቅንጅት')],['custom',say('Custom','ብጁ')]])+`<div class="wp-actions">${button('select-services',tr('selectAll'),'all')}${button('select-services',tr('clearAll'),'none')}</div><div class="wp-seed-grid wp-full">${ui.templates.map(t=>`<label class="wp-seed"><input type="checkbox" data-wp-service-code="${esc(t.code)}" ${w.selectedServiceCodes.includes(t.code)?'checked':''}><span><strong>${esc(serviceName(t))}</strong><small>${tr(t.category)}${t.aftercare?' · '+tr('aftercare'):''}</small></span></label>`).join('')}</div>`;
    if(index===4)content=`<p class="wp-full wp-muted">${tr(w.weddingDate?'deadlineHint':'unscheduledHint')}</p><div class="wp-full">${table([tr('service'),tr('deadline'),tr('tasks')],selected.map(t=>`<tr><th scope="row">${esc(serviceName(t))}</th><td>${dateMarkup(suggestedDate(t))}${t.aftercare?' · '+tr('aftercare'):''}</td><td>${t.tasks.length}</td></tr>`))}</div>`;
    if(index===5)content=`<dl class="wp-definition wp-full"><div><dt>${tr('weddingTitle')}</dt><dd>${esc(w.title)}</dd></div><div><dt>${tr('date')}</dt><dd>${dateMarkup(w.weddingDate)}</dd></div><div><dt>${tr('guests')}</dt><dd>${w.guestEstimate}</dd></div><div><dt>${tr('budget')}</dt><dd>${money(w.budgetMinor)}</dd></div><div><dt>${tr('services')}</dt><dd>${selected.length} · ${selected.reduce((n,t)=>n+t.tasks.length,0)} ${tr('tasks')}</dd></div><div><dt>${tr('owner')}</dt><dd>${tr('you')}</dd></div></dl><p class="wp-caption wp-full">${tr('deadlineHint')}</p><div class="wp-tag-list wp-full">${selected.map(t=>`<span>${esc(serviceName(t))}</span>`).join('')}</div>`;
    modal(`${tr('create')} · ${index+1} / 6`,`<ol class="wp-wizard-steps">${steps.map((step,i)=>`<li class="${i===index?'is-active':i<index?'is-done':''}" ${i===index?'aria-current="step"':''}><span>${i<index?'✓':i+1}</span>${tr(step)}</li>`).join('')}</ol><h3>${tr(steps[index])}</h3><form id="wpWizardForm"><div class="wp-form-grid">${content}</div></form>`,`${button('wizard-save',tr('draft'))}<span class="wp-toolbar-spacer"></span>${index?button('wizard-back',tr('back')):''}${button(index===5?'wizard-finish':'wizard-next',index===5?tr('activate'):tr('next'),'',true)}`,true);
  }
  async function persistWizard(activate=false) {
    if(!collectWizard())return;
    const w=ui.wizard;
    if(w.clientId)return questionnaireHandoff(`weddings/clients/${w.clientId}/plan`);
    if(!w.title.trim())throw new Error(say('Enter the couple display name before saving.','ከማስቀመጥዎ በፊት የጥንዶቹን ስም ያስገቡ።'));
    if(activate&&!w.selectedServiceCodes.length)throw new Error(say('Choose at least one service.','ቢያንስ አንድ አገልግሎት ይምረጡ።'));
    const body=Object.fromEntries(weddingFields.filter(k=>w[k]!==undefined).map(k=>[k,w[k]]));
    if(w.id)body.version=w.version;
    const saved=await api(w.id?`weddings/${w.id}`:'weddings',w.id?'PATCH':'POST',body);
    Object.assign(w,saved);
    if(activate)await api(`weddings/${saved.id}/activate`,'POST',{version:saved.version});
    dialog.close();toast(tr('saved'));go(saved.id);
  }
  async function dateChangeDialog() {
    ui.datePreview=null;
    modal(tr('changeDate'),`<form id="wpDateForm"><div class="wp-form-grid">${field('weddingDate',tr('date'),'date',ui.project.weddingDate)}${field('reason',tr('reason'),'textarea','',[],true)}</div><div id="wpDatePreview"></div></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpDateForm" id="wpDateSubmit">${tr('preview')}</button>`,true);
  }
  async function saveDateChange() {
    const body=formValues(document.getElementById('wpDateForm'));
    const preview=await api(base('date-change-preview'),'POST',{weddingDate:body.weddingDate||null});
    if(ui.datePreview?.previewToken!==preview.previewToken) {
      ui.datePreview=preview;document.getElementById('wpDatePreview').innerHTML=impactMarkup(preview);
      document.getElementById('wpDateSubmit').textContent=tr('applyDate');return;
    }
    await api(base('date-change'),'POST',{...body,weddingDate:body.weddingDate||null,previewToken:preview.previewToken,version:ui.project.version});
    dialog.close();toast(tr('saved'));await loadRoute();
  }
  async function documentDialog(id) {
    const doc=await api(base('document-requests/'+id));ui.document=doc;
    modal(doc.title,`<div class="wp-card-head">${badge(doc.status)}<span>${tr('revision')} ${doc.revision||0}</span></div>${doc.versions.length?table([tr('revision'),tr('name'),tr('date'),''],doc.versions.map(v=>`<tr><td>${v.revision}</td><th scope="row">${esc(v.filename)}</th><td>${dateMarkup(v.createdAt,true)}</td><td>${button('download-file',tr('download'),v.fileId)}</td></tr>`)):empty()}${doc.reviews.length?`<h3>${tr('history')}</h3>${doc.reviews.map(r=>`<article class="wp-review"><div class="wp-card-head">${badge(r.decision)}<small>${dateMarkup(r.reviewedAt,true)}</small></div><p>${esc(r.comment||'')}</p><small>${esc(ownerName(r.reviewerUserId))}</small></article>`).join('')}`:''}`,`${button('upload',tr('upload'),id)}${doc.status==='under_review'?button('review-document',tr('review'),id,true):''}${button('close',tr('close'))}`,true);
  }
  async function uploadDialog(id) {
    ui.document=await api(base('document-requests/'+id));
    modal(tr('upload'),`<p>${esc(ui.document.title)}</p><form id="wpUploadForm"><div class="wp-field"><label for="wpUploadFile">${tr('documents')}</label><input id="wpUploadFile" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" required></div><p class="wp-caption">${tr('fileHint')}</p></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpUploadForm">${tr('upload')}</button>`);
  }
  async function reviewDialog(id) {
    const doc=await api(base('document-requests/'+id));ui.document=doc;
    const last=doc.versions.find(v=>v.id===doc.latestVersionId);
    modal(tr('review'),`<p><strong>${esc(doc.title)}</strong> · ${tr('revision')} ${doc.revision}</p>${last?button('download-file',tr('download'),last.fileId):''}<form id="wpReviewForm"><div class="wp-form-grid">${field('decision',tr('decision'),'select','approved',['approved','changes_requested','rejected'])}${field('comment',tr('comment'),'textarea')}</div></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpReviewForm">${tr('save')}</button>`);
  }
  function downloadBlob(blob,filename) {
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  async function downloadFile(id) {
    const file=await api(base('files/'+id));const bytes=Uint8Array.from(atob(file.contentBase64),c=>c.charCodeAt(0));
    downloadBlob(new Blob([bytes],{type:file.mimeType}),file.filename);
  }
  async function memberDialog() {
    ui.members=(await api(base('members'))).items;
    modal(tr('team'),`${table([tr('name'),say('Roles','ሚናዎች'),tr('services')],ui.members.map(m=>`<tr><th scope="row">${esc(m.name)}<small>${esc(m.userId)}</small></th><td>${esc(m.roles.map(label).join(', '))}</td><td>${m.serviceIds.length}</td></tr>`))}<h3>${say('Add or update an existing member','ነባር አባል ጨምር ወይም አስተካክል')}</h3><form id="wpMemberForm"><div class="wp-form-grid">${field('userId',say('Existing user ID','የነባር ተጠቃሚ መለያ'),'text','',[],true)}${field('name',tr('name'),'text','',[],true)}<fieldset class="wp-full"><legend>${say('Roles','ሚናዎች')}</legend><div class="wp-check-grid">${['planner','coordinator','couple','vendor','church',...(permissions().roles.includes('admin')?['admin']:[])].map(role=>`<label class="wp-check"><input type="checkbox" data-wp-member-role="${role}">${esc(label(role))}</label>`).join('')}</div></fieldset><fieldset class="wp-full"><legend>${tr('services')}</legend><div class="wp-check-grid">${ui.dashboard.services.map(s=>`<label class="wp-check"><input type="checkbox" data-wp-member-service="${s.id}">${esc(serviceName(s))}</label>`).join('')}</div></fieldset>${field('notificationsEnabled',tr('reminders'),'checkbox',true)}</div></form>`,`${button('close',tr('close'))}<button type="submit" class="wp-btn wp-primary" form="wpMemberForm">${tr('save')}</button>`,true);
  }
  async function templatesDialog() {
    const response=await api('service-templates');ui.templates=response.items;
    modal(tr('settings'),`<p class="wp-muted">${tr('templateHint')}</p>${table([say('Code','መለያ'),tr('service'),say('Days from wedding','ከሰርጉ ቀን አንጻር ያሉ ቀናት'),tr('revision'),''],response.items.map(t=>`<tr><td>${esc(t.code)}</td><th scope="row">${esc(serviceName(t))}</th><td>${t.relativeOffsetDays}</td><td>${t.templateVersion}</td><td>${response.canEdit?button('edit-template',tr('edit'),t.code):''}</td></tr>`))}`,`${response.canEdit?button('new-template','+ '+tr('add'),'',true):''}${button('close',tr('close'))}`,true);
  }
  function templateEditor(code) {
    const template=ui.templates.find(t=>t.code===code)||{code:'',name:'',nameAm:'',category:'logistics',relativeOffsetDays:-90,defaultEnabled:true,aftercare:false,approvalRequired:false,critical:false,evidence:'Verify readiness',tasks:[{code:'verify',title:'Verify readiness',offsetDays:-14,required:true,priority:'normal'}]};
    ui.template=template;
    const fields=[field('code',say('Service code','የአገልግሎት መለያ'),'text',template.code,[],true),field('name',tr('name'),'text',template.name,[],true),field('nameAm',say('Amharic name','የአማርኛ ስም'),'text',template.nameAm),field('category',tr('category'),'select',template.category,['spiritual','atmosphere','people','hospitality','logistics'].map(c=>[c,tr(c)])),field('relativeOffsetDays',say('Days relative to wedding (negative = before)','ከሰርጉ ቀን አንጻር ያሉ ቀናት'),'number',template.relativeOffsetDays),field('evidence',tr('evidence'),'textarea',template.evidence),...['defaultEnabled','aftercare','approvalRequired','critical'].map(k=>field(k,say(({defaultEnabled:'Enabled by default',aftercare:'Aftercare',approvalRequired:'Approval required',critical:'Critical readiness check'})[k],({defaultEnabled:'በነባሪ የተካተተ',aftercare:'ድህረ ጋብቻ',approvalRequired:'ማጽደቅ ያስፈልጋል',critical:'አስፈላጊ የዝግጁነት ማረጋገጫ'})[k]),'checkbox',template[k])),field('tasks',say('Task templates (JSON)','የተግባር አብነቶች (JSON)'),'json',JSON.stringify(template.tasks,null,2))].join('');
    modal(tr('settings'),`<p class="wp-caption">${tr('templateHint')}</p><form id="wpTemplateForm"><div class="wp-form-grid">${fields}</div></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpTemplateForm">${tr('save')}</button>`,true);
  }
  async function templateUpgradeDialog(id) {
    const service=await api(base('services/'+id));
    const preview=await api(base(`services/${id}/template-upgrade-preview`),'POST',{version:service.version});
    ui.upgrading={service,preview};
    modal(say('Review template update','የአብነት ለውጡን ይገምግሙ'),`<p><strong>${esc(serviceName(service))}</strong> · v${preview.fromVersion} → v${preview.toVersion}</p><div class="wp-preview-list">${preview.changes.map(c=>`<div><strong>${esc(label(c.action))} · ${esc(c.title)}</strong><span>${dateMarkup(c.before)} → ${dateMarkup(c.after)}</span></div>`).join('')}</div><p class="wp-caption">${preview.retained.length} ${say('existing checks retained. Completed evidence and manual deadlines are preserved.','ነባር ማረጋገጫዎች ይቀመጣሉ። የተጠናቀቁ ማስረጃዎች እና የእጅ ቀናት አይጠፉም።')}</p>${preview.warnings.map(w=>`<p class="wp-risk">${esc(w.message)}</p>`).join('')}<form id="wpUpgradeForm">${field('reason',tr('reason'),'textarea','',[],true)}</form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpUpgradeForm" ${preview.warnings.length?'disabled':''}>${tr('save')}</button>`,true);
  }
  function editWeddingDialog() {
    const w=ui.project;
    const next={draft:[],planning:['final_review','cancelled'],final_review:['planning','event_live','cancelled'],event_live:['completed','cancelled'],completed:['archived',...(permissions().roles.includes('admin')?['planning']:[])],cancelled:['archived'],archived:[]};
    modal(tr('edit'),`<form id="wpWeddingForm"><div class="wp-form-grid">${field('title',tr('weddingTitle'),'text',w.title,[],true)}${field('status',tr('status'),'select',w.status,[w.status,...(next[w.status]||[])])}${field('guestEstimate',tr('guestsEstimate'),'integer',w.guestEstimate)}${field('budgetMinor',tr('totalBudget'),'money',amountValue(w.budgetMinor))}${field('city',tr('city'),'text',w.city)}${field('calendarPreference',tr('calendarPreference'),'select',w.calendarPreference,[['gregorian',say('Gregorian','ጎርጎርዮስ')],['ethiopian',say('Ethiopian','ኢትዮጵያ')]])}${field('churchLocation',tr('churchLocation'),'text',w.churchLocation)}${field('venueLocation',tr('venueLocation'),'text',w.venueLocation)}${field('reason',tr('reason'),'textarea')}</div></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpWeddingForm">${tr('save')}</button>`,true);
  }
  async function serviceVerification(id,complete=false) {
    const service=await api(base('services/'+id));ui.verifying={service,complete};
    modal(complete?tr('complete'):tr('confirm'),`<p><strong>${esc(serviceName(service))}</strong></p><form id="wpVerifyForm"><div class="wp-form-grid">${field('evidence',tr('evidence'),'textarea','',[],true)}${complete?field('occurredAt',say('Actual delivery time · Addis Ababa','የማጠናቀቂያ ሰዓት · አዲስ አበባ'),'datetime-local',localInput(new Date().toISOString()),[],true):''}</div></form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpVerifyForm">${tr('save')}</button>`);
  }
  async function dependenciesDialog(id) {
    ui.dependencyTask=await api(base('tasks/'+id));
    let response=await api(base('tasks')+'?limit=100'),tasks=[...response.items];
    while(response.nextCursor){response=await api(base('tasks')+'?limit=100&cursor='+response.nextCursor);tasks.push(...response.items);}
    const edges=ui.dashboard.dependencies.filter(e=>e.successor_id===id);
    modal(say('Task dependencies','የተግባር ቅድመ መስፈርቶች'),`<p>${esc(taskName(ui.dependencyTask))}</p>${edges.map(edge=>`<div class="wp-task-row"><span class="wp-task-main">${esc(taskName(tasks.find(t=>t.id===edge.predecessor_id)||{title:edge.predecessor_id}))}</span>${button('remove-dependency',tr('cancel'),edge.predecessor_id)}</div>`).join('')}<form id="wpDependencyForm">${field('predecessorTaskId',say('Prerequisite task','ቅድመ ተግባር'),'select','',[['',tr('any')],...tasks.filter(t=>t.id!==id&&!edges.some(e=>e.predecessor_id===t.id)).map(t=>[t.id,taskName(t)])],true)}</form>`,`${button('close',tr('close'))}<button type="submit" class="wp-btn wp-primary" form="wpDependencyForm">${tr('add')}</button>`,true);
  }
  function cacheKey(){return 'matrimony-coordination:'+ui.cap.userId+':'+ui.id;}
  async function coordinationSheet() {
    try {const sheet=await api(base('run-sheet'));try{localStorage.setItem(cacheKey(),JSON.stringify(sheet));}catch{}return sheet;}
    catch(error){const cached=JSON.parse(localStorage.getItem(cacheKey())||'null');if(cached&&cached.userId===ui.cap.userId&&new Date(cached.expiresAt)>new Date()&&![401,403,404].includes(error.status))return cached;throw error;}
  }
  function sheetBody(sheet) {
    return `<header><p>MATRIMONY BY HANNA · ${tr('day')}</p><h1>${esc(sheet.wedding.title)}</h1><p>${esc(sheet.wedding.weddingDate||tr('noDate'))} · Africa/Addis_Ababa (UTC+3)</p><p>${esc(sheet.wedding.churchLocation||'')} ${esc(sheet.wedding.venueLocation||'')}</p></header><h2>${tr('day')}</h2>${table([tr('date'),tr('title'),tr('owner'),tr('status')],sheet.events.map(e=>`<tr><td>${esc(timeText(e.startAt))}–${esc(timeText(e.endAt))}</td><td><strong>${esc(e.title)}</strong><p>${esc(e.cue||'')}</p><small>${esc(e.location||'')}</small></td><td>${esc(ownerName(e.ownerUserId))}${e.backupOwnerUserId?`<br>↳ ${esc(ownerName(e.backupOwnerUserId))}`:''}</td><td>${esc(label(e.status))}</td></tr>`))}<h2>${tr('arrival')}</h2>${table([tr('name'),say('Phone','ስልክ'),tr('arrival')],sheet.contacts.map(v=>`<tr><th scope="row">${esc(v.name)}</th><td>${esc(v.contactName||'')}<br>${esc(v.phone||'')}</td><td>${esc(timeText(v.arrivalAt))}</td></tr>`))}<h2>${tr('incidents')}</h2>${sheet.issues.map(i=>`<p><strong>${esc(label(i.severity))} · ${esc(i.title)}</strong><br>${esc(i.action||'')} · ${esc(ownerName(i.ownerUserId))}</p>`).join('')||'<p>—</p>'}<footer><p>${say('Read-only coordination snapshot. Last updated','ለንባብ ብቻ የቀን ዕቅድ። የተዘመነው')}: ${esc(dateText(sheet.generatedAt,true))}</p></footer>`;
  }
  async function exportSheet(print=false) {
    const sheet=await coordinationSheet();
    const html=`<!doctype html><html lang="${lang()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>${esc(sheet.wedding.title)} · ${tr('day')}</title><style>body{font:14px/1.5 Arial,Nyala,sans-serif;color:#171c1b;max-width:1000px;margin:40px auto;padding:24px}header{border-bottom:2px solid #164c4b;margin-bottom:24px}h1{font:36px Georgia,Nyala,serif}h2{margin-top:30px}table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;vertical-align:top;border-bottom:1px solid #ddd}p{margin:8px 0}small,footer{color:#555}footer{margin-top:40px;border-top:1px solid #ddd}tr{break-inside:avoid}@media print{body{margin:0;padding:0}@page{size:A4;margin:16mm}}</style></head><body>${sheetBody(sheet)}</body></html>`;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    if(print){const url=URL.createObjectURL(blob),win=window.open(url,'_blank');if(!win)throw new Error(say('Allow the print window to open.','የህትመት መስኮቱን እንዲከፈት ፍቀዱ።'));win.addEventListener('load',()=>win.print(),{once:true});setTimeout(()=>URL.revokeObjectURL(url),60000);}
    else downloadBlob(blob,'Matrimony-'+sheet.wedding.title.replace(/[^\p{L}\p{N}_-]/gu,'-')+'-coordination.html');
  }
  async function handleAction(action,id) {
    const createMap={'new-task':'tasks','new-service':'services','new-event':'events','new-cue':'events','new-vendor':'vendor-assignments','new-budget':'budget-lines','new-payment':'payment-milestones','new-document':'document-requests','new-guest':'guests','new-issue':'issues','new-board':'design-boards','new-note':'notes','new-milestone':'milestones'};
    const editMap={'edit-task':'tasks','edit-service':'services','edit-event':'events','edit-vendor':'vendor-assignments','edit-budget':'budget-lines','edit-payment':'payment-milestones','edit-guest':'guests','edit-issue':'issues','edit-board':'design-boards','edit-milestone':'milestones'};
    if(createMap[action])return openEditor(createMap[action],null,{...(ui.service?{serviceId:ui.service.id}:{}),...(action==='new-cue'?{eventType:'run_sheet'}:{})});
    if(editMap[action])return openEditor(editMap[action],id);
    if(action==='tab'){dialog?.close();go(ui.id,id);return;}
    if(['tasks-tab','budget-tab','documents-tab'].includes(action)){go(ui.id,action.split('-')[0]);return;}
    if(action==='all'){go();return;}
    if(action==='open-wedding'){go(id);return;}
    if(action==='create')return startWizard();
    if(action==='setup')return startWizard(true);
    if(action==='questionnaire')return openQuestionnaire();
    if(action==='questionnaire-services')return openQuestionnaire(1);
    if(action==='questionnaire-edit')return openQuestionnaire(0,id);
    if(action==='use-questionnaire')return questionnaireHandoff(`weddings/clients/${id}/plan`);
    if(action==='service-details')return serviceDetailsDialog();
    if(action==='edit-wedding')return editWeddingDialog();
    if(action==='service')return openService(id);
    if(action==='service-tab')return openService(ui.service.id,id);
    if(action==='verify-service'||action==='complete-service')return serviceVerification(id,action==='complete-service');
    if(action==='close'){dialog?.close();return;}
    if(action==='retry'||action==='reload'){dialog?.close();if(ui.capError)await loadCapabilities().catch(()=>{});return loadRoute();}
    if(action==='more')return loadRoute(id);
    if(action==='category'){go(ui.id,'services');ui.filters.category=id;return loadRoute();}
    if(action==='show-blockers'){document.getElementById('wpBlockers')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    if(action==='date-change')return dateChangeDialog();
    if(action==='wizard-back'){if(collectWizard()){ui.wizardStep--;renderWizard();}return;}
    if(action==='wizard-next'){if(collectWizard()){if(ui.wizardStep===3&&!ui.wizard.selectedServiceCodes.length)throw new Error(say('Choose at least one service.','ቢያንስ አንድ አገልግሎት ይምረጡ።'));ui.wizardStep++;renderWizard();}return;}
    if(action==='wizard-save'||action==='wizard-finish')return persistWizard(action==='wizard-finish');
    if(action==='select-services'){dialog.querySelectorAll('[data-wp-service-code]').forEach(input=>input.checked=id==='all');return;}
    if(action==='calendar-view'){ui.calendarView=id;return loadRoute();}
    if(action==='month-prev'||action==='month-next'){const sign=action==='month-next'?1:-1,view=ui.calendarView||'month',d=new Date((view==='month'?ui.month+'-01':ui.calendarAnchor)+'T12:00:00Z');if(view==='month')d.setUTCMonth(d.getUTCMonth()+sign);else d.setUTCDate(d.getUTCDate()+sign*(view==='week'?7:1));ui.calendarAnchor=d.toISOString().slice(0,10);ui.month=ui.calendarAnchor.slice(0,7);return loadRoute();}
    if(action==='calendar-day'){ui.calendarAnchor=id;ui.month=id.slice(0,7);ui.calendarView='day';return loadRoute();}
    if(action==='document')return documentDialog(id);
    if(action==='upload')return uploadDialog(id);
    if(action==='review-document')return reviewDialog(id);
    if(action==='download-file')return downloadFile(id);
    if(action==='members')return memberDialog();
    if(action==='templates')return templatesDialog();
    if(action==='edit-template'||action==='new-template')return templateEditor(id);
    if(action==='upgrade-template')return templateUpgradeDialog(id);
    if(action==='dependencies')return dependenciesDialog(id);
    if(action==='remove-dependency'){await api(base(`tasks/${ui.dependencyTask.id}/dependencies`),'POST',{version:ui.dependencyTask.version,predecessorTaskId:id,remove:true});await loadRoute();return dependenciesDialog(ui.dependencyTask.id);}
    if(action==='refresh-day'){await loadRoute();await coordinationSheet();toast(tr('saved'));return;}
    if(action==='export'||action==='print')return exportSheet(action==='print');
    if(action==='arrived'){const vendor=await api(base('vendor-assignments/'+id));await api(base('vendor-assignments/'+id),'PATCH',{version:vendor.version,arrivedAt:new Date().toISOString()});toast(tr('saved'));return loadRoute();}
    if(action==='generate-reminders'){const result=await api(base('reminders/generate'),'POST',{});toast(`${result.created} ${tr('reminders').toLowerCase()}`);return loadRoute();}
    if(action==='acknowledge'){const n=data('notifications').find(n=>n.id===id);await api(base('notifications/'+id),'PATCH',{version:n.version,status:'delivered'});return loadRoute();}
    if(action==='preferences'){modal(tr('reminders'),`<form id="wpPreferencesForm">${field('enabled',say('Receive in-app reminders','የመተግበሪያ ማስታወሻዎችን ተቀበል'),'checkbox',true)}</form>`,`${button('close',tr('cancel'))}<button type="submit" class="wp-btn wp-primary" form="wpPreferencesForm">${tr('save')}</button>`);return;}
  }
  const submitters={
    wpResourceForm:saveResource,wpDateForm:saveDateChange,
    wpQuestionnaireSyncForm:async()=>{const {path,body,preview}=ui.questionnairePending;await questionnaireHandoff(path,{...body,previewToken:preview.previewToken,resolutions:formValues(document.getElementById('wpQuestionnaireSyncForm'))});},
    wpLinkQuestionnaireForm:async()=>{const values=formValues(document.getElementById('wpLinkQuestionnaireForm'));await questionnaireHandoff(base('questionnaire'),{clientId:Number(values.clientId),version:ui.project.version});},
    wpServiceDetailsForm:async()=>{
      const form=document.getElementById('wpServiceDetailsForm'),values=formValues(form),details=ui.serviceDetails;
      const options={...details.options};
      details.definition.options.forEach(option=>{
        options[option.id]=option.type==='multi'?[...form.querySelectorAll(`[data-wp-detail-choice="${option.id}"]:checked`)].map(i=>i.value):values['detail-'+option.id];
      });
      await api(base(`services/${details.serviceId}/questionnaire-details`),'POST',{version:details.version,recordSignature:details.recordSignature,options,notes:values.serviceNotes});
      toast(tr('saved'));await loadRoute();await openService(details.serviceId);
    },
    wpWizardForm:async()=>ui.wizard.clientId&&ui.clientSource?questionnaireHandoff(`weddings/clients/${ui.wizard.clientId}/plan`):handleAction(ui.wizardStep===5?'wizard-finish':'wizard-next',''),
    wpWeddingForm:async()=>{await api(base(),'PATCH',{...formValues(document.getElementById('wpWeddingForm')),version:ui.project.version});dialog.close();toast(tr('saved'));await loadRoute();},
    wpVerifyForm:async()=>{const {service,complete}=ui.verifying;await api(base(`services/${service.id}/${complete?'complete':'verify'}`),'POST',{...formValues(document.getElementById('wpVerifyForm')),version:service.version});dialog.close();toast(tr('saved'));await loadRoute();await openService(service.id);},
    wpUploadForm:async()=>{const file=document.getElementById('wpUploadFile').files[0];if(!file||file.size>1048576)throw new Error(tr('fileHint'));const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Could not read this file.'));reader.readAsDataURL(file);});const mime=file.type||(/\.txt$/i.test(file.name)?'text/plain':'');const d=ui.document;await api(base(`document-requests/${d.id}/versions`),'POST',{version:d.version,filename:file.name,mimeType:mime,contentBase64:content});await loadRoute();await documentDialog(d.id);toast(tr('saved'));},
    wpReviewForm:async()=>{const d=ui.document;await api(base(`document-requests/${d.id}/review`),'POST',{...formValues(document.getElementById('wpReviewForm')),version:d.version,documentVersionId:d.latestVersionId});await loadRoute();await documentDialog(d.id);toast(tr('saved'));},
    wpMemberForm:async()=>{const form=document.getElementById('wpMemberForm');await api(base('members'),'POST',{...formValues(form),roles:[...form.querySelectorAll('[data-wp-member-role]:checked')].map(i=>i.dataset.wpMemberRole),serviceIds:[...form.querySelectorAll('[data-wp-member-service]:checked')].map(i=>i.dataset.wpMemberService)});toast(tr('saved'));await memberDialog();},
    wpTemplateForm:async()=>{const body=formValues(document.getElementById('wpTemplateForm'));body.relativeOffsetDays=Number(body.relativeOffsetDays);if(ui.template.version)body.version=ui.template.version;await api('service-templates'+(ui.template.version?'/'+ui.template.code:''),ui.template.version?'PATCH':'POST',body);toast(tr('saved'));await templatesDialog();},
    wpUpgradeForm:async()=>{const {service,preview}=ui.upgrading;await api(base(`services/${service.id}/template-upgrade`),'POST',{...formValues(document.getElementById('wpUpgradeForm')),version:service.version,previewToken:preview.previewToken});dialog.close();toast(tr('saved'));await loadRoute();await openService(service.id);},
    wpDependencyForm:async()=>{await api(base(`tasks/${ui.dependencyTask.id}/dependencies`),'POST',{...formValues(document.getElementById('wpDependencyForm')),version:ui.dependencyTask.version});await loadRoute();await dependenciesDialog(ui.dependencyTask.id);},
    wpPreferencesForm:async()=>{await api(base('reminders/preferences'),'POST',formValues(document.getElementById('wpPreferencesForm')));dialog.close();toast(tr('saved'));},
  };
  document.addEventListener('submit',async event=>{
    const submit=submitters[event.target.id];
    if(!submit)return;
    event.preventDefault();
    const form=event.target;if(form.dataset.busy==='true')return;form.dataset.busy='true';
    const buttons=[...dialog.querySelectorAll('button[type=submit]')];buttons.forEach(b=>b.disabled=true);
    try{document.getElementById('wpFormError').hidden=true;await submit();}catch(error){formError(error);}finally{form.dataset.busy='false';buttons.forEach(b=>b.disabled=false);}
  });
  document.addEventListener('click',async event=>{
    const target=event.target.closest('[data-wp-action]');if(!target||target.disabled)return;
    event.preventDefault();if(target.dataset.busy==='true')return;target.dataset.busy='true';
    try{await handleAction(target.dataset.wpAction,target.dataset.id||'');}catch(error){if(dialog?.open)formError(error);else toast(error.message);}finally{target.dataset.busy='false';}
  });
  document.addEventListener('click',event=>{
    if(typeof state==='undefined')return;
    const handoff=event.target.closest('[data-continue-planning], #weddingPlanningNav');
    if(handoff&&ui.cap.enabled&&state.currentStep!==5&&(handoff.matches('[data-continue-planning]')||state.recordId||state.details.brideName?.trim()||state.details.groomName?.trim())) {
      event.preventDefault();event.stopImmediatePropagation();
      if(!handoff.disabled)continueQuestionnaire().catch(error=>toast(error.message));
      return;
    }
    if(state.currentStep!==5)return;
    if(event.target.closest('.recent-heading [data-step-target="4"]')){event.preventDefault();event.stopImmediatePropagation();go();return;}
    const destination=event.target.closest('[data-step-target]');
    if(destination&&ui.project?.clientId&&ui.cap.canAccessClients&&['0','1','6','2','3'].includes(destination.dataset.stepTarget)) {
      event.preventDefault();event.stopImmediatePropagation();
      openQuestionnaire(Number(destination.dataset.stepTarget)).catch(error=>toast(error.message));return;
    }
    if(!event.target.closest('#resetDraftButton'))return;
    event.preventDefault();event.stopImmediatePropagation();
    startWizard().catch(error=>toast(error.message));
  },true);
  let filterTimer;
  document.addEventListener('input',event=>{
    const input=event.target;if(!input.matches('[data-wp-filter]')||input.tagName==='SELECT')return;
    clearTimeout(filterTimer);filterTimer=setTimeout(async()=>{const key=input.dataset.wpFilter,position=input.selectionStart;ui.filters[key]=input.value;await loadRoute();const replacement=root.querySelector(`[data-wp-filter="${key}"]`);replacement?.focus();replacement?.setSelectionRange(position,position);},300);
  });
  document.addEventListener('change',async event=>{
    const input=event.target;
    if(input.matches('[data-wp-filter]')){ui.filters[input.dataset.wpFilter]=input.value;await loadRoute();}
    if(input.id==='wp-clientId'&&ui.wizard&&input.closest('#wpWizardForm')) {
      const client=ui.clients.find(c=>String(c.id)===input.value);
      ui.wizard.clientId=client?.id||null;ui.clientSource=null;
      try {
        if(client){ui.clientSource=await api('weddings/clients/'+client.id);Object.assign(ui.wizard,ui.clientSource.fields,{selectedServiceCodes:ui.clientSource.selectedServiceCodes});}
        renderWizard();
      } catch(error){formError(error);}
    }
    if(input.id==='wp-package'&&ui.wizard&&input.value==='day_of'){dialog.querySelectorAll('[data-wp-service-code]').forEach(box=>{const t=ui.templates.find(t=>t.code===box.dataset.wpServiceCode);box.checked=!t.aftercare&&t.relativeOffsetDays>=-60;});}
    if(input.id==='wp-userId'){const member=ui.members.find(m=>m.userId===input.value);if(member){document.getElementById('wp-name').value=member.name;dialog.querySelectorAll('[data-wp-member-role]').forEach(i=>i.checked=member.roles.includes(i.dataset.wpMemberRole));dialog.querySelectorAll('[data-wp-member-service]').forEach(i=>i.checked=member.serviceIds.includes(i.dataset.wpMemberService));document.getElementById('wp-notificationsEnabled').checked=member.notificationsEnabled;}}
  });
  window.addEventListener('popstate',()=>{dialog?.close();if(location.pathname.startsWith('/weddings')){if(typeof state!=='undefined'&&state.currentStep!==5)setStep(5);else loadRoute();}else if(typeof setStep==='function')setStep(0);});
  window.addEventListener('plan-step-change',()=>{
    if(typeof state==='undefined')return;
    if(state.currentStep===5){if(!location.pathname.startsWith('/weddings'))history.pushState({},'','/weddings');loadRoute();}
    else if(location.pathname.startsWith('/weddings')){history.pushState({},'','/');dialog?.close();document.querySelector('.sidebar-search').hidden=false;applyLocalization();renderCoupleContext();}
  });
  let previousLanguage=lang();
  window.addEventListener('plan-ui-update',()=>{if(previousLanguage===lang()){if(typeof state!=='undefined'&&state.currentStep===5)planningContext();return;}previousLanguage=lang();if(ui.project)renderWorkspace();else if(ui.data.list)renderList();});
  async function loadCapabilities() {
    try {ui.cap=await api('weddings/capabilities');ui.capError=null;}
    catch(error){ui.cap={};ui.capError=error;throw error;}
  }
  (async()=>{
    try {
      await loadCapabilities();
      document.querySelector('[data-continue-planning]').hidden=!(ui.cap.enabled&&ui.cap.authenticated&&ui.cap.canAccessClients);
      if(ui.cap.authenticated&&!ui.cap.canCreate){document.querySelectorAll('.workflow-nav [data-step-target]').forEach(b=>b.hidden=b.dataset.stepTarget!=='5');document.querySelector('.sidebar-main').hidden=true;document.getElementById('resetDraftButton').hidden=true;document.querySelector('.sidebar-search').hidden=true;document.getElementById('topbarCoupleName').hidden=true;}
      if(location.pathname.startsWith('/weddings')||ui.cap.authenticated&&!ui.cap.canCreate)setStep(5);
    } catch(error) {if(location.pathname.startsWith('/weddings')){setStep(5);root.innerHTML=`<div class="wp-alert" role="alert">${esc(error.message)}</div>`;}}
  })();
})();
