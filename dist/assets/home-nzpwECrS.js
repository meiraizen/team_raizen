import{a as p,R as u,j as e,u as f,T as h}from"./index-CE22Tmb4.js";import{G as t}from"./Grid-CczGPLtB.js";import{C as g}from"./Container-Bqx7qS9X.js";const r=document.createElement("link");r.href="https://fonts.googleapis.com/css?family=Alegreya+Sans+SC";r.rel="stylesheet";document.head.appendChild(r);const c=document.createElement("style");c.innerHTML=`
  .card-link-custom {
    height: 200px;
    width: 275px;
    background: #fff;
    padding: 40px 20px 60px 20px;
    border-radius: 10px;
    transition: all 300ms ease;
    cursor: pointer;
    box-sizing: border-box;
    font-family: 'Alegreya Sans SC', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    outline: none;
  }
  .card-link-custom:hover {
    box-shadow: 20px 20px 0px 0px rgba(0, 0, 0, 0.3);
    border: 1px solid #1f3b64;
    transform: translate(-5px,-5px);
  }
  .card-link-title {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 0.5em;
    color: #0b0b0cff;
    text-align: center;
  }
  .card-link-desc {
    font-size: 1rem;
    color: #333;
    text-align: center;
  }
  @media (max-width: 500px) {
    .card-link-custom {
      width: 90vw;
      min-width: 140px;
      height: auto;
      padding: 20px 10px 30px 10px;
    }
    .card-link-title {
      font-size: 1.1rem;
    }
    .card-link-desc {
      font-size: 0.95rem;
    }
  }
`;document.head.appendChild(c);const n=({title:s,description:i,to:o})=>{const m=p(),[x,a]=u.useState(!1),d=()=>{o&&m(o)};return e.jsxs("div",{className:"card-link-custom",style:x?{boxShadow:"10px 10px 0px 0px rgba(0, 0, 0, 0.3)",border:"1px solid #050a12ff",transform:"translate(-5px,-5px)"}:{},onClick:d,tabIndex:0,role:"button","aria-pressed":"false",onMouseEnter:()=>a(!0),onMouseLeave:()=>a(!1),onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&d()},children:[e.jsx("div",{className:"card-link-title",children:s}),e.jsx("div",{className:"card-link-desc",children:i})]})};function j(){return e.jsxs(t,{container:!0,spacing:4,sx:{mt:2},children:[e.jsx(t,{item:!0,xs:12,sm:6,md:4,children:e.jsx(n,{title:"Bill Book",description:"Manage your bills.",to:"/billbook"})}),e.jsx(t,{item:!0,xs:12,sm:6,md:4,children:e.jsx(n,{title:"Verify Certificate",description:"Verify student certificates.",to:"/verify-certificate"})}),e.jsx(t,{item:!0,xs:12,sm:6,md:4,children:e.jsx(n,{title:"Students Info",description:"View student information.",to:"/students-info"})}),e.jsx(t,{item:!0,xs:12,sm:6,md:4,children:e.jsx(n,{title:"Take Attendance",description:"Mark student attendance.",to:"/attendance"})}),e.jsx(t,{item:!0,xs:12,sm:6,md:4,children:e.jsx(n,{title:"Chat",description:"Message your teammates.",to:"/chat"})}),e.jsx(t,{item:!0,xs:12,sm:6,md:4,children:e.jsx(n,{title:"Online Dojo",description:"Join our online coding sessions.",to:"/onlinedojo"})}),e.jsx(t,{item:!0,xs:12,sm:6,md:4,children:e.jsx(n,{title:"Register Student",description:"Register a new student.",to:"/student-registration"})})]})}function w(){const s=f(o=>o.user),i={welcome:{fontWeight:600,fontSize:20,color:"black"},name:{fontWeight:800,fontSize:24,color:"red"}};return e.jsxs(g,{maxWidth:"md",sx:{mt:4},children:[e.jsx(h,{gutterBottom:!0,children:s&&s.name?e.jsxs(e.Fragment,{children:[e.jsx("span",{style:i.welcome,children:"Welcome Back, "}),e.jsx("span",{style:i.name,children:s.name})]}):"Welcome to Raizen Management"}),e.jsx(j,{})]})}export{w as default};
