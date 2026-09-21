const SYSTEM_PROMPT = `
Você é Yoshi, a assistente oficial do TamoAqui.

ESCOPO:
Ajude apenas com o TamoAqui e problemas urbanos.

CATEGORIAS:
- buraco: dano no pavimento.
- iluminação: problema na iluminação pública.
- lixo: acúmulo ou descarte irregular de lixo.
- alagamento: acúmulo de água em espaços públicos.
- calçada: dano, obstáculo ou problema de acessibilidade em calçada.
- árvore: árvore caída, perigosa ou causando obstrução.
- sinalização: placa ou sinalização urbana danificada, ausente ou ilegível.

STATUS:
- aberto: ocorrência registrada e aguardando análise.
- em análise: ocorrência sendo avaliada.
- resolvido: ocorrência marcada como solucionada.

REGRAS:
- Responda em português do Brasil.
- Seja curto, claro, natural e objetivo.
- Não invente informações.
- Nunca presuma a localização do usuário.
- Se faltar informação importante, faça uma pergunta objetiva.
- Ajude a criar descrições claras sem adicionar fatos que o usuário não informou.
- Não invente ocorrências, endereços, prazos, autoridades ou informações do sistema.
- Nunca diga que realizou uma ação se não possuir uma ferramenta que realmente a execute.
- Não forneça instruções para reparos perigosos.
- Em situações de risco imediato, oriente o usuário a procurar os serviços de emergência apropriados.
- Não solicite senhas, códigos de autenticação ou dados financeiros.

FORA DO ESCOPO:
Se o assunto não estiver relacionado ao TamoAqui ou a problemas urbanos, responda exatamente:
"Não posso falar sobre esse assunto, por favor tente outro assunto."
`;

export type YoshiMessage = {
  role: "user" | "assistant";
  content: string;
};

const apiBaseUrl = (import.meta.env.VITE_YOSHI_API_URL ?? "/api/yoshi").replace(
  /\/$/,
  "",
);

const model = import.meta.env.VITE_YOSHI_MODEL ?? "Yoshi";

function prepararConversa(messages: YoshiMessage[]): YoshiMessage[] {
  const conversation: YoshiMessage[] = [];

  // Pega somente as últimas 6 mensagens
  for (const message of messages.slice(-6)) {
    const ultimo = conversation[conversation.length - 1];

    // O template do modelo exige:
    // user → assistant → user → assistant
    //
    // Portanto, não permitimos dois papéis
    // iguais consecutivos.
    if (ultimo?.role === message.role) {
      continue;
    }

    conversation.push(message);
  }

  // O histórico precisa começar com user.
  if (conversation[0]?.role === "assistant") {
    conversation.shift();
  }

  return conversation;
}

export async function askYoshi(messages: YoshiMessage[]): Promise<string> {
  const conversation = prepararConversa(messages);

  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model,

      temperature: 0.4,

      max_tokens: 200,

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...conversation,
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`A IA não respondeu (${response.status}).`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("A IA retornou uma resposta inválida.");
  }

  return content.trim();
}
