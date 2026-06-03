import{j as e,r as o}from"./index-CE22Tmb4.js";import{B as N}from"./BackButton-BcbJ69w3.js";import{s as z}from"./tempDatabase-CDRLO4wr.js";function y({name:n,course:r,date:s}){return e.jsxs("div",{className:"App",children:[e.jsx(B,{}),e.jsx("p",{className:"byline",children:"issued by Raizen"}),e.jsxs("div",{className:"content",children:[e.jsx("p",{children:"Earned by"}),e.jsx("h1",{children:n}),e.jsx("p",{children:"for completing: Belt Grading Examination"}),e.jsx("h2",{children:r})]}),s&&e.jsxs("p",{className:"date",children:["Issued on ",e.jsx("span",{className:"bold",children:s})]})]})}y.defaultProps={name:"Sam Ebinezer",course:"Best Grading Examination",date:"March 15 2021"};const B=()=>e.jsxs("svg",{width:"99",height:"139",viewBox:"0 0 99 139",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("path",{d:"M0 0H99V138.406L52.1955 118.324L0 138.406V0Z",fill:"white"}),e.jsx("path",{d:"M25.4912 83.2515C25.4912 79.4116 27.0222 75.7289 29.7474 73.0137C32.4727 70.2985 36.1689 68.7731 40.0229 68.7731C43.877 68.7731 47.5732 70.2985 50.2984 73.0137C53.0236 75.7289 54.5546 79.4116 54.5546 83.2515M40.0229 59.724C40.0229 55.8841 41.5539 52.2014 44.2791 49.4862C47.0044 46.7709 50.7006 45.2455 54.5546 45.2455C58.4087 45.2455 62.1049 46.7709 64.8301 49.4862C67.5553 52.2014 69.0863 55.8841 69.0863 59.724V83.2515",stroke:"#0379FF",strokeWidth:"10.6193"})]}),V=({size:n=40,color:r="rgba(16, 15, 15, 1)",backgroundColor:s="#f3f3f3",minHeight:l="200px",margin:c="2rem 0"})=>e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:l,margin:c,width:"100%"},children:e.jsx("div",{className:"custom-spinner",style:{border:`4px solid ${s}`,borderTop:`4px solid ${r}`,borderRadius:"50%",width:`${n}px`,height:`${n}px`}})}),e.jsx("style",{jsx:!0,children:`
        .custom-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `})]});function F(){o.useEffect(()=>{const t=document.createElement("link");return t.href="https://cdn.jsdelivr.net/npm/boxicons@2.0.5/css/boxicons.min.css",t.rel="stylesheet",document.head.appendChild(t),()=>{document.head.contains(t)&&document.head.removeChild(t)}},[]);const[n,r]=o.useState(""),[s,l]=o.useState(null),[c,d]=o.useState([]),[x,u]=o.useState(!1),[m,h]=o.useState(""),[j,a]=o.useState(!1),f=t=>{const i=t.target.value;if(r(i),l(null),h(""),!i.trim()){d([]),a(!1);return}const p=z.filter(g=>{const b=i.toLowerCase();return g.name.toLowerCase().includes(b)||String(g.id).includes(b)});d(p),a(!0)},v=t=>{l(t),r(t.name),a(!1),d([]),u(!0),setTimeout(()=>{u(!1)},1e3)},w=()=>{n&&c.length>0&&a(!0)},C=()=>{setTimeout(()=>{a(!1)},200)},k=()=>{r(""),d([]),a(!1),l(null),h("")},S=(t,i)=>{if(!i)return t;const p=new RegExp(`(${i})`,"gi");return t.replace(p,"<b>$1</b>")};return e.jsxs("div",{style:{padding:"40px 20px",minHeight:"100vh",background:"#f4f7f8"},children:[e.jsx(N,{to:"/home"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",fontFamily:"Poppins, sans-serif",color:"rgb(44, 62, 80)"},children:[e.jsx("h1",{style:{fontSize:"2rem",marginBottom:"2rem",color:"rgb(44, 62, 80)",textAlign:"center"},children:"Verify Certificate"}),e.jsxs("div",{className:`con-search ${n?"":"notValue"} ${j?"focus":""}`,children:[e.jsxs("div",{className:"con-input",children:[e.jsx("input",{onBlur:C,onFocus:w,placeholder:"Search by Name or ID",onInput:f,value:n,onChange:f,type:"text"}),e.jsx("i",{className:"bx bx-search"}),e.jsx("i",{onClick:k,className:"bx bx-x"})]}),e.jsxs("div",{className:"content-results",children:[e.jsx("div",{className:"con-results",children:c.map((t,i)=>e.jsxs("div",{className:"result",onClick:()=>v(t),style:{animationDelay:`${i*20}ms`,opacity:1,marginTop:0},children:[e.jsx("h5",{dangerouslySetInnerHTML:{__html:S(t.name,n)}}),e.jsxs("p",{children:["ID: ",t.id," | Belt Level: ",t.belt_level]}),e.jsx("div",{className:"web",children:"Click to select"})]},t.id))}),e.jsx("div",{className:"not-results",children:"No Results Found"})]})]}),x&&e.jsx(V,{}),m&&e.jsx("div",{style:{color:"#f44336",marginBottom:"1rem",fontSize:"1rem"},children:m}),s&&!x&&e.jsx("div",{style:{display:"flex",justifyContent:"center",width:"100%",marginTop:"2rem"},children:e.jsx(y,{name:s.name,course:`Belt Level: ${s.belt_level}`,date:s.exam_records?.[s.exam_records.length-1]?.date})})]}),e.jsx("style",{jsx:!0,children:`
        * {
          list-style: none;
          outline: none;
          padding: 0;
          margin: 0;
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
        }

        .con-search {
          position: relative;
          width: 400px;
          max-width: 100%;
        }

        .focus .content-results {
          opacity: 1;
          visibility: visible;
          transform: translate(0, 0);
        }

        .con-input {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .con-input i {
          position: absolute;
          right: 15px;
          font-size: 1.5rem;
          transition: all .25s ease;
          opacity: .5;
        }

        .notValue .con-input i.bx-search {
          display: block;
        }

        .con-input i.bx-search {
          display: none;
        }

        .notValue .con-input i.bx-x {
          display: none;
        }

        .con-input i.bx-x {
          display: block;
          cursor: pointer;
        }

        .con-input input {
          width: 100%;
          padding: 15px 20px;
          box-sizing: border-box;
          border: 0px;
          border-radius: 20px;
          transition: all .25s ease;
          background: white;
          font-size: 1rem;
        }

        .con-input input:focus {
          transform: translate(0, -6px);
          box-shadow: 0px 10px 20px 0px rgba(0,0,0,.05);
        }

        .con-input input:focus ~ i {
          transform: translate(0, -6px);
          opacity: 1;
        }

        .content-results {
          position: absolute;
          width: 100%;
          background: #fff;
          margin-top: 10px;
          border-radius: 25px;
          box-shadow: 0px 10px 20px 0px rgba(0,0,0,.05);
          transform: translate(0, -10px);
          transition: all .25s ease;
          opacity: 0;
          z-index: 10;
          visibility: hidden;
          padding-right: 10px;
          overflow: hidden;
        }

        .con-results {
          width: 100%;
          overflow: auto;
          max-height: 300px;
          margin-top: 10px;
          margin-bottom: 10px;
        }

        .con-results:empty {
          margin-top: 0px;
          margin-bottom: 0px;
        }

        .not-results {
          text-align: center;
          padding: 15px;
          font-size: .9rem;
          opacity: .7;
          display: none;
          color: rgba(244, 0, 0, 1);
        }

        .con-search:not(.notValue) .con-results:empty ~ .not-results {
          display: block;
        }

        .con-results .result {
          padding: 15px;
          margin: 5px 0px;
          list-style: none;
          transition: all .25s ease;
          position: relative;
          cursor: pointer;
          width: calc(100% - 10px);
          margin-left: 10px;
          border-radius: 20px;
        }

        .con-results .result:hover {
          background: #f4f7f8;
        }

        .con-results .result p {
          font-size: .9rem;
          color: rgba(44, 62, 80, .6);
        }

        .con-results .result h5 {
          margin: 0 0 5px 0;
          font-size: 1rem;
        }

        .con-results .result b {
          background: rgba(44, 62, 80, .1);
          text-decoration: underline;
          color: rgba(44, 62, 80, 1);
          border-radius: 2px;
        }

        .web {
          position: absolute;
          right: 0px;
          top: 0px;
          font-size: .8rem;
          color: rgba(44, 62, 80, .5);
          padding: 20px;
        }

        .hidden {
          opacity: 0;
          margin-top: -15px;
        }

        .con-results::-webkit-scrollbar {
          width: 5px;
        }

        .con-results::-webkit-scrollbar-thumb {
          border-radius: 5px;
          background: #000;
        }
      `})]})}export{F as default};
