import type { Language } from "../types";

export default function KeySetupGuide({ lang }: { lang: Language }) {
  const ml = lang === "ml";
  return <details className="key-setup-guide">
    <summary>{ml ? "Gemini സേവനം എങ്ങനെ പ്രവർത്തിക്കുന്നു?" : "How is Gemini configured?"}</summary>
    <p>{ml ? "API key സെർവറിൽ സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു. സന്ദർശകർ key നൽകേണ്ടതില്ല. സ്വന്തം വാക്യം നൽകുമ്പോൾ പാഠം തയ്യാറാക്കാൻ അത് Google-ലേക്ക് അയയ്ക്കും." : "The API key is configured on the server. Visitors do not need to enter a key. Custom sentences are sent to Google to generate a lesson."}</p>
    <p>{ml ? "സൈറ്റ് നിയന്ത്രിക്കുന്നവർ server/.env-ൽ GEMINI_API_KEY, GEMINI_TEXT_MODEL എന്നിവ ക്രമീകരിക്കണം. API ഉപയോഗപരിധികളും നിരക്കുകളും ബാധകമാണ്." : "Site operators configure GEMINI_API_KEY and GEMINI_TEXT_MODEL in server/.env. API quotas and charges may apply."}</p>
  </details>;
}
