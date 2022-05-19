"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("react");function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var r=t(e);const s={user:null,isAuthenticated:!1,isLoading:!0,checkSession:null},i=()=>{throw new Error("Oops! Seems like you forgot to wrap your app in <KindeProvider>.")},o=e.createContext({...s,user:i,isLoading:i,isAuthenticated:i,checkSession:i});exports.AuthContext=o,exports.KindeProvider=({children:t,initialUser:i})=>{const[a,n]=e.useState({...s,user:i,isLoading:!i,isAuthenticated:!!i}),u="/api/auth/me",c=e.useCallback((async()=>{try{const e=await(async e=>{let t;try{t=await fetch(e)}catch{throw new RequestError(0)}if(t.ok)return t.json();t.status})(u);n((t=>({...t,user:e,error:void 0})))}catch(e){n((t=>({...t,error:e})))}}),[u]);e.useEffect((async()=>{a.user||(await c(),n((e=>({...e,isLoading:!1}))))}),[a.user]);const{user:d,error:l,isLoading:h,isAuthenticated:f}=a;return r.default.createElement(o.Provider,{value:{user:d,error:l,isLoading:h,isAuthenticated:f}},t)},exports.useAuth=()=>e.useContext(o);
