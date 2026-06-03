import{r as n,j as e,u as C,A as M,C as A,D,E,a as P,F as B}from"./index-CE22Tmb4.js";const T=n.memo(({onBack:s,showSidebar:d,children:t,onSearch:c})=>{const[a,p]=n.useState("");return n.useCallback(l=>{const i=l.target.value;p(i),c?.(i)},[c]),n.useCallback(()=>{p(""),c?.("")},[c]),e.jsxs("div",{className:`sidebar ${d?"open":"closed"}`,"aria-hidden":!d,children:[e.jsxs("div",{className:"sidebar-header",children:[e.jsx("button",{className:"back-button",onClick:s,children:"← Back"}),e.jsx("h1",{className:"sidebar-title",children:"Messages"})]}),t]})}),U=n.memo(({contact:s,isActive:d,onClick:t,lastMessage:c,isOnline:a})=>e.jsxs("div",{className:`contact-item ${d?"contact-active":""}`,onClick:t,children:[e.jsxs("div",{className:"contact-avatar",children:[e.jsx("div",{className:"avatar-circle",children:s.name[0].toUpperCase()}),e.jsx("div",{className:`status-dot ${a?"online":"offline"}`})]}),e.jsxs("div",{className:"contact-info",children:[e.jsx("div",{className:"contact-name",children:s.name}),e.jsx("div",{className:"contact-preview",children:c||"Start a conversation"})]})]})),F=n.memo(({contacts:s=[],peer:d,onSelectContact:t,getLastMessage:c,searchTerm:a="",onlineUsers:p=[]})=>{const l=n.useMemo(()=>{if(!a.trim())return s;const i=a.toLowerCase();return s.filter(h=>h.name.toLowerCase().includes(i)||h.email.toLowerCase().includes(i))},[s,a]);return l.length===0?e.jsx("div",{className:"contacts-list",children:e.jsxs("div",{className:"no-results",children:[e.jsx("div",{className:"no-results-icon",children:"🔍"}),e.jsx("div",{className:"no-results-text",children:"No contacts found"}),e.jsx("div",{className:"no-results-subtext",children:"Try a different search term"})]})}):e.jsx("div",{className:"contacts-list",children:l.map(i=>{const h=p.includes(i.email);return e.jsx(U,{contact:i,isActive:d===i.email,onClick:()=>t(i.email),lastMessage:c(i.email),isOnline:h},i.email)})})}),Y=n.memo(({selectedContact:s,loading:d,onBack:t,isMobile:c,isOnline:a})=>e.jsxs("div",{className:"chat-header",children:[c&&e.jsx("button",{className:"mobile-back",onClick:t,children:"←"}),s?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"chat-avatar",children:s.name[0].toUpperCase()}),e.jsxs("div",{className:"chat-info",children:[e.jsx("h3",{children:s.name}),e.jsx("p",{className:"chat-status",children:d?"Loading...":a?"Online":"Offline"})]})]}):e.jsxs("div",{className:"chat-info",children:[e.jsx("h3",{children:"Select a conversation"}),e.jsx("p",{className:"chat-status",children:"Choose someone to start messaging"})]})]})),K=n.memo(({message:s,isOwn:d,onRetry:t})=>{const c=n.useMemo(()=>{const l=new Date(s.created_at),i=new Date,h=new Date(i.getFullYear(),i.getMonth(),i.getDate()),w=new Date(l.getFullYear(),l.getMonth(),l.getDate()),j=Math.floor((h-w)/864e5),v=l.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return j===0?`Today ${v}`:j===1?`Yesterday ${v}`:`${l.toLocaleDateString()} ${v}`},[s.created_at]),a=n.useMemo(()=>{const l=s.content||"",i=[],h=/((https?:\/\/|www\.)[^\s<]+)(?![^<]*>)/gi;let w=0,j;for(;(j=h.exec(l))!==null;){const N=j.index;N>w&&i.push(l.slice(w,N));let y=j[0];const b=y.match(/[),.!?]+$/);let k="";b&&(k=b[0],y=y.slice(0,-k.length));const r=y.startsWith("http")?y:`https://${y}`;i.push(e.jsx("a",{href:r,target:"_blank",rel:"noopener noreferrer",className:"msg-link",children:y},`lnk-${i.length}`)),k&&i.push(k),w=j.index+j[0].length}w<l.length&&i.push(l.slice(w));const v=[];return i.forEach((N,y)=>{if(typeof N=="string"){const b=N.split(`
`);b.forEach((k,r)=>{k&&v.push(k),r<b.length-1&&v.push(e.jsx("br",{},`br-${y}-${r}`))})}else v.push(N)}),v},[s.content]),p=()=>{if(!d)return null;switch(s.status){case"sending":return e.jsx("span",{className:"msg-status sending",children:"…"});case"sent":return e.jsx("span",{className:"msg-status sent",children:"✓"});case"received":return e.jsx("span",{className:"msg-status received",children:"✓✓"});case"error":return e.jsx("span",{className:"msg-status error",onClick:()=>t?.(s.id),children:"!"});default:return null}};return e.jsx("div",{className:`msg-wrapper ${d?"msg-own":"msg-other"}`,children:e.jsxs("div",{className:`msg-bubble ${d?"msg-bubble-own":"msg-bubble-other"}`,children:[e.jsx("div",{className:"msg-text",children:a}),e.jsxs("div",{className:"msg-meta",children:[e.jsx("span",{className:"msg-time",children:c}),p()]})]})})}),_=n.memo(({type:s,selectedContactName:d})=>s==="select"?e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:"💬"}),e.jsx("div",{className:"empty-text",children:"Select a contact to start messaging"}),e.jsx("div",{className:"empty-subtext",children:"Choose from your contacts on the left"})]}):s==="loading"?e.jsx("div",{className:"loading-state",children:"Loading messages..."}):e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:"👋"}),e.jsx("div",{className:"empty-text",children:"No messages yet"}),e.jsxs("div",{className:"empty-subtext",children:["Start the conversation",d?` with ${d}`:""]})]})),W=n.memo(({peer:s,loading:d,messages:t,user:c,selectedContactName:a,retry:p,refreshing:l})=>s?d&&t.length===0?e.jsx(_,{type:"loading"}):!d&&t.length===0?e.jsx(_,{type:"empty",selectedContactName:a}):e.jsx(e.Fragment,{children:t.map(i=>e.jsx(K,{message:i,isOwn:i.sender_email===c?.email,onRetry:p},i.id))}):e.jsx(_,{type:"select"})),H=n.memo(({input:s,setInput:d,onSend:t,disabled:c,placeholder:a="Type a message..."})=>{const p=n.useCallback(i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),t())},[t]),l=n.useCallback(()=>{s.trim()&&!c&&t()},[s,c,t]);return e.jsx("div",{className:"input-container",children:e.jsxs("div",{className:"input-wrapper",children:[e.jsx("textarea",{className:"message-input",value:s,onChange:i=>d(i.target.value),onKeyDown:p,placeholder:a,disabled:c,rows:1}),e.jsx("button",{className:"send-button",onClick:l,disabled:c||!s.trim(),title:"Send message",children:"➤"})]})})}),X=s=>{const t=C(r=>r.user)?.email,[c,a]=n.useState([]),[p,l]=n.useState(!1),[i,h]=n.useState(!1),w=n.useRef(null),j=n.useRef(null),v=n.useRef({lastId:null,lastAt:null}),N=6e3,y=n.useCallback(async({background:r=!1}={})=>{if(!t||!s){a([]),l(!1),h(!1);return}c.length===0&&!r?l(!0):r&&h(!0);try{const{data:x}=await M({a:t,b:s,limit:200}),m=(x||[]).filter(f=>f.sender_email===t&&f.receiver_email===s||f.sender_email===s&&f.receiver_email===t).sort((f,u)=>new Date(f.created_at)-new Date(u.created_at)).map(f=>({...f,status:f.sender_email===t?"sent":"received"}));a(m);const o=m[m.length-1];o&&(v.current={lastId:o.id,lastAt:o.created_at})}finally{l(!1),h(!1)}},[t,s]);n.useEffect(()=>{const r=j.current;r&&c.length>0&&(r.scrollTop=r.scrollHeight)},[c.length]),n.useEffect(()=>{y()},[y]),n.useEffect(()=>{if(!(!t||!s))return w.current?.(),w.current=A({a:t,b:s,onInsert:r=>{a(x=>{if(x.some(u=>u.id===r.id))return x;const m=x.findIndex(u=>u._optimistic&&u.sender_email===r.sender_email&&u.receiver_email===r.receiver_email&&u.content===r.content);let o;m!==-1?(o=[...x],o[m]={...r,status:r.sender_email===t?"sent":"received"}):o=[...x,{...r,status:r.sender_email===t?"sent":"received"}],o.sort((u,S)=>new Date(u.created_at)-new Date(S.created_at));const f=o[o.length-1];return f&&(v.current={lastId:f.id,lastAt:f.created_at}),o})}}),()=>w.current?.()},[t,s]),n.useEffect(()=>{if(!t||!s)return;const r=setInterval(async()=>{try{const{data:x}=await M({a:t,b:s,limit:5}),m=(x||[]).filter(u=>u.sender_email===t&&u.receiver_email===s||u.sender_email===s&&u.receiver_email===t).sort((u,S)=>new Date(u.created_at)-new Date(S.created_at)),o=m[m.length-1];if(!o)return;const{lastId:f}=v.current;o.id!==f&&y({background:!0})}catch{}},N);return()=>clearInterval(r)},[t,s,y]);const b=n.useCallback(async r=>{const x=r.trim();if(!x||!t||!s)return;const m={id:`tmp_${Date.now()}`,sender_email:t,receiver_email:s,content:x,created_at:new Date().toISOString(),_optimistic:!0,status:"sending"};a(o=>[...o,m]);try{const{data:o,error:f}=await D({sender_email:t,receiver_email:s,content:x});if(f)throw f;a(u=>u.map(S=>S.id===m.id?{...o,status:"sent"}:S)),o&&(v.current={lastId:o.id,lastAt:o.created_at})}catch{a(f=>f.map(u=>u.id===m.id?{...u,status:"error",errorMsg:"Send failed"}:u))}},[t,s]),k=n.useCallback(async r=>{const x=c.find(m=>m.id===r&&m.status==="error");if(x){a(m=>m.map(o=>o.id===r?{...o,status:"sending"}:o));try{const{data:m,error:o}=await D({sender_email:t,receiver_email:s,content:x.content});if(o)throw o;a(f=>f.map(u=>u.id===r?{...m,status:"sent"}:u))}catch{a(m=>m.map(o=>o.id===r?{...o,status:"error"}:o))}}},[c,t,s]);return{messages:c,loading:p,refreshing:i,send:b,retry:k,messagesRef:j}},q=s=>{const[d,t]=n.useState(window.innerWidth<=768),[c,a]=n.useState(!d);n.useEffect(()=>{const l=()=>{const i=window.innerWidth<=768;t(i),a(!i||!s)};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[s]);const p=n.useCallback(()=>{a(l=>!l)},[]);return{isMobile:d,showSidebar:c,setShowSidebar:a,toggleSidebar:p}};function G(){const d=C(a=>a.user)?.email,[t,c]=n.useState([]);return n.useEffect(()=>{if(!d)return;const a=E.channel("presence:chat",{config:{presence:{key:d}}});a.on("presence",{event:"sync"},()=>{const l=a.presenceState(),i=Object.keys(l);c(i.filter(h=>h!==d))}),a.subscribe(l=>{l==="SUBSCRIBED"&&a.track({online_at:new Date().toISOString()})});const p=()=>{a.track({online_at:new Date().toISOString()})};return window.addEventListener("focus",p),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&p()}),()=>{try{a.untrack()}catch{}try{E.removeChannel(a)}catch{}window.removeEventListener("focus",p)}},[d]),t}function Q(){const s=C(g=>g.user),d=P(),[t,c]=n.useState(""),[a,p]=n.useState(""),[l,i]=n.useState(""),{messages:h,loading:w,send:j,messagesRef:v,retry:N,refreshing:y}=X(t),{isMobile:b,showSidebar:k,setShowSidebar:r}=q(t),x=G(),[m,o]=n.useState([]);n.useEffect(()=>{(async()=>{const{data:g}=await B();g&&o(g.filter(O=>O.is_active!==!1))})()},[]);const f=n.useMemo(()=>m.filter(g=>g.email!==s?.email).map(g=>({id:String(g.id),email:g.email,name:g.full_name})),[m,s?.email]),u=n.useMemo(()=>f.find(g=>g.email===t),[f,t]),S=u?x.includes(u.email):!1,L=n.useCallback(()=>{a.trim()&&(j(a.trim()),p(""))},[a,j]),I=n.useCallback(g=>{c(g),b&&r(!1)},[b,r]),z=n.useCallback(()=>{b&&t?(c(""),r(!0)):d("/home")},[b,t,r,d]),R=n.useCallback(g=>t===g&&h.length>0?h[h.length-1].content:"",[t,h]),$=n.useCallback(g=>{i(g)},[]);return n.useEffect(()=>{!t&&b&&!k&&r(!0)},[t,b,k,r]),n.useEffect(()=>{!b&&!t&&f.length>0},[b,t,f]),s?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        .chat-app {
          height: calc(100vh - 140px);
          display: flex;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 320px;
          background: #fafafa;
          border-right: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 16px 20px;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-button {
          background: none;
          border: 1px solid #ddd;
          color: #666;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .back-button:hover {
          background: #eee;
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: #333;
        }

        .search-bar {
          padding: 12px 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px;
          padding-right: 32px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
        }

        .search-input:focus {
          border-color: #007bff;
        }

        .search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .search-clear:hover {
          background: #f0f0f0;
          color: #333;
        }

        .contacts-list {
          flex: 1;
          overflow-y: auto;
        }

        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }

        .no-results-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .no-results-text {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .no-results-subtext {
          font-size: 12px;
          opacity: 0.7;
        }

        .contact-item {
          padding: 12px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-item:hover {
          background: #f8f8f8;
        }

        .contact-active {
          background: #e3f2fd;
          border-right: 3px solid #007bff;
        }

        .contact-avatar {
          position: relative;
          width: 40px;            /* ensure fixed size */
          height: 40px;
          flex-shrink: 0;         /* prevent shrinking */
        }

        .avatar-circle {
          width: 100%;            /* fill container */
          height: 100%;
          border-radius: 50% !important; /* enforce circle */
          background: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 500;
          font-size: 16px;
          overflow: hidden;       /* clip anything overflow */
          border: 1px solid rgba(0,0,0,0.05); /* subtle edge for visibility */
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
            bottom: 0;
            right: 0;
          border: 2px solid #fff;
          background: #bbb; /* offline */
        }
        .status-dot.online {
          background: #34c759; /* green online */
        }

        .contact-info {
          flex: 1;
          min-width: 0;
        }

        .contact-name {
          font-weight: 500;
          font-size: 14px;
          color: #333;
          margin-bottom: 2px;
        }

        .contact-preview {
          font-size: 12px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Chat Area */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .chat-header {
          padding: 16px 20px;
          background: #f9f9f9;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-back {
          background: none;
          border: none;
          color: #007bff;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          display: none;
        }

        .chat-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          font-size: 14px;
        }

        .chat-info h3 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .chat-status {
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        /* Messages */
        .messages-container {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-text {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .empty-subtext {
          font-size: 12px;
          opacity: 0.7;
        }

        .msg-wrapper {
          display: flex;
          margin-bottom: 4px;
        }

        .msg-own {
          justify-content: flex-end;
        }

        .msg-other {
          justify-content: flex-start;
        }

        .msg-bubble {
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 16px;
          word-wrap: break-word;
        }

        .msg-bubble-own {
          background: #007bff;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .msg-bubble-other {
          background: #f5f5f5;
          color: #333;
          border-bottom-left-radius: 4px;
        }

        .msg-text {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 2px;
        }

        .msg-time {
          font-size: 10px;
          opacity: 0.7;
          text-align: right;
        }
        /* Added message status styles */
        .msg-meta {
          display: flex;
          gap: 4px;
          align-items: center;
          justify-content: flex-end;
          font-size: 10px;
          opacity: 0.7;
          margin-top: 2px;
        }
        .msg-status {
          font-size: 10px;
        }
        .msg-status.sending { opacity: 0.5; }
        .msg-status.sent { color: #e0f2ff; }
        .msg-status.received { color: #e0f2ff; }
        .msg-status.error { color: #dc3545; cursor: pointer; font-weight: 600; }
        .msg-status.error:hover { text-decoration: underline; }

        /* Links inside messages */
        .msg-link,
        .msg-link:visited {
          color: black;
        }
        .msg-link:hover {
          text-decoration: underline;
          opacity: 0.9;
        }
        .msg-link:focus {
          outline: 2px solid rgba(0, 0, 0, 0.4);
          outline-offset: 2px;
        }

        /* Input Area */
        .input-container {
          padding: 16px 20px;
          background: #f9f9f9;
          border-top: 1px solid #e0e0e0;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 20px;
          max-height: 80px;
          font-family: inherit;
        }

        .message-input:focus {
          border-color: #007bff;
        }

        .send-button {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: #007bff;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .send-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .loading-state {
          text-align: center;
          color: #666;
          padding: 20px;
          font-size: 14px;
        }

        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #dc3545;
          font-size: 14px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: absolute;
            z-index: 10;
            height: 100%;
            transition: transform 0.2s ease;
          }
          .sidebar.closed {
            transform: translateX(-100%);
            pointer-events: none;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .chat-main {
            width: 100%;
          }
          .mobile-back {
            display: block;
          }
          .messages-container {
            padding: 12px;
          }
          .input-container {
            padding: 12px 16px;
          }
        }
      `}),e.jsxs("div",{className:"chat-app",children:[e.jsx(T,{onBack:z,showSidebar:k,onSearch:$,children:e.jsx(F,{contacts:f,peer:t,onSelectContact:I,getLastMessage:R,searchTerm:l,onlineUsers:x})}),e.jsxs("div",{className:"chat-main",children:[e.jsx(Y,{selectedContact:u,loading:w,onBack:z,isMobile:b,isOnline:S}),e.jsx("div",{className:"messages-container",ref:v,children:e.jsx(W,{peer:t,loading:w,messages:h,user:s,messagesRef:v,selectedContactName:u?.name,retry:N,refreshing:y})}),e.jsx(H,{input:a,setInput:p,onSend:L,disabled:!t,placeholder:t?"Type a message...":"Select a contact to start messaging"})]})]})]}):e.jsx("div",{className:"error-state",children:"Please log in to use chat"})}export{Q as default};
