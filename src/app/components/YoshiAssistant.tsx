import { FormEvent, useState } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { askYoshi, type YoshiMessage } from "../../lib/yoshi";

const initialMessage: YoshiMessage = {
  role: "assistant",
  content:
    "Olá! Eu sou a Yoshi, assistente do TamoAqui. Posso ajudar a registrar uma ocorrência ou tirar dúvidas sobre categorias e status.",
};

export function YoshiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<YoshiMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const answer = await askYoshi(nextMessages);
      setMessages((current) => [...current, { role: "assistant", content: answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Não foi possível conectar com a Yoshi, tente novamente mais tarde.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <section className="w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <p className="text-sm font-black">Yoshi</p>
                <p className="text-[11px] opacity-80">Assistente do TamoAqui</p>
              </div>
            </div>
            <button aria-label="Fechar assistente" onClick={() => setOpen(false)}>
              <X size={19} />
            </button>
          </header>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="flex w-fit items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <LoaderCircle size={15} className="animate-spin" /> Pensando…
              </div>
            )}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Como posso ajudar?"
              className="min-w-0 flex-1 rounded-xl bg-muted px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
              disabled={loading}
            />
            <button
              type="submit"
              aria-label="Enviar mensagem"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-primary p-2 text-primary-foreground disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      <button
        aria-label={open ? "Fechar assistente" : "Abrir assistente Yoshi"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
