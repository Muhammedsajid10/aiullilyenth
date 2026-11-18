import { useEffect, useState } from "react";
import type {Config,Language} from "../types";
import {chooseModels, GeminiError, listModels, saveModels} from "../lib/gemini";
import {t} from "../i18n";
export default function Settings({lang,config,onChange,onClose,onDemo,onCustom}:{lang:Language;config:Config;onChange:(c:Config)=>void;onClose:()=>void;onDemo:()=>void;onCustom:()=>void}) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function refresh(){setBusy(true);setError("");try {const next=chooseModels(await listModels(""),config);saveModels(next);onChange(next);}catch(e){setError(t(lang,e instanceof GeminiError?e.code:"errorData"));}finally{setBusy(false);}}
  useEffect(()=>{if(!config.models.length) void refresh();},[]);
  return <dialog open className="settings-dialog" aria-label={t(lang,"settings")}>
    <h2>{t(lang,"settings")}</h2>
    <p>{lang==="ml"?"Gemini API key സുരക്ഷിതമായി സെർവറിൽ സൂക്ഷിക്കുന്നു. ഇവിടെ key നൽകേണ്ടതില്ല.":"The Gemini API key is managed securely on the server. No personal key is required."}</p>
    {error&&<p role="alert" className="error">{error}</p>}
    <button disabled={busy} onClick={()=>void refresh()}>{busy?"Loading…":t(lang,"refreshModels")}</button>
    <button onClick={onCustom}>{lang==="ml"?"സ്വന്തം വാക്യം പരീക്ഷിക്കാം":"Try my own sentence"}</button>
    <button onClick={onDemo}>{t(lang,"demoFallback")}</button>
    <button onClick={onClose}>{lang==="ml"?"അടയ്ക്കുക":"Close"}</button>
  </dialog>;
}
