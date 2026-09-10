// A FIAÇÃO DOS DOIS BOTÕES — mesmo mecanismo de
// `fiacao-leads-chama-conversas-paradas.test.ts`: esta casa não tem jsdom nem
// testing-library (`vitest.config.ts` usa `environment: "node"`), então não
// há como "clicar" em teste e observar `useState` mudar. Ler o código-fonte
// é o único mecanismo disponível, sem instalar dependência nova, para provar
// que o botão CHAMA a função certa e que o SUCESSO recarrega a fila.
//
// O QUE ESTE TESTE PEGA: alguém trocar `marcarContatado`/`confirmarCliente`
// por outra função dentro do handler do botão; alguém apagar a chamada a
// `aoRecarregar()` do caminho de sucesso; alguém fazer o botão "Marcar como
// contatado" ou "Confirmar que é deste cliente" deixar de existir no JSX.
//
// O QUE ESTE TESTE **NÃO** PEGA: que a cadeia exista no texto do arquivo não
// prova que o `onClick` MONTA de fato no DOM, nem que o estado "enviando"
// desabilita o botão em produção — isso exigiria jsdom, que esta casa não
// tem. Também não prova que `aoRecarregar` de fato refaz o `fetch` (isso é
// `acoes-da-fila.test.ts`, que testa `marcarContatado`/`confirmarCliente`
// isoladas, e `fiacao-leads-chama-conversas-paradas.test.ts`, que já prova
// que `onTentarDeNovo` está ligado a `carregarConversasParadas`). Este
// arquivo prova só a fiação ENTRE os nomes — mais barato e mais fraco que um
// teste de comportamento; vendê-lo como mais forte do que é vale menos que
// não tê-lo.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const PAGINA = fs.readFileSync(path.join(process.cwd(), "app/agency/leads/page.tsx"), "utf8");

/** O corpo de `CartaoConversaParada`, isolado do resto do arquivo — para não
 *  confundir, por exemplo, uma menção a `marcarContatado` num comentário de
 *  outra função com a chamada real dentro do handler. */
function corpoDoCartao(): string {
  const inicio = PAGINA.indexOf("function CartaoConversaParada(");
  expect(inicio).toBeGreaterThan(-1);
  const fimAproximado = PAGINA.indexOf("\nfunction diasDesde(", inicio);
  expect(fimAproximado).toBeGreaterThan(inicio);
  return PAGINA.slice(inicio, fimAproximado);
}

describe("o botão 'Marcar como contatado' chama marcarContatado, e o sucesso recarrega a fila", () => {
  it("o handler `marcar` chama `await marcarContatado(conversa.fio)`", () => {
    const corpo = corpoDoCartao();
    const inicioDoHandler = corpo.indexOf("const marcar = async () => {");
    expect(inicioDoHandler).toBeGreaterThan(-1);
    const fimDoHandler = corpo.indexOf("};", inicioDoHandler);
    const handler = corpo.slice(inicioDoHandler, fimDoHandler);

    expect(handler).toContain("await marcarContatado(conversa.fio)");
  });

  it("no sucesso (r.ok), o handler chama aoRecarregar() — nunca escreve o estado à mão", () => {
    const corpo = corpoDoCartao();
    const inicioDoHandler = corpo.indexOf("const marcar = async () => {");
    const fimDoHandler = corpo.indexOf("};", inicioDoHandler);
    const handler = corpo.slice(inicioDoHandler, fimDoHandler);

    const inicioDoIf = handler.indexOf("if (r.ok)");
    expect(inicioDoIf).toBeGreaterThan(-1);
    const trechoDoIf = handler.slice(inicioDoIf, handler.indexOf("} else {", inicioDoIf));
    expect(trechoDoIf).toContain("aoRecarregar();");
  });

  it("o JSX liga o botão ao handler: onClick chama marcar()", () => {
    const corpo = corpoDoCartao();
    expect(corpo).toContain("onClick={() => void marcar()}");
    expect(corpo).toContain("Marcar como contatado");
  });
});

describe("o botão 'Confirmar que é deste cliente' chama confirmarCliente, e o sucesso recarrega a fila", () => {
  it("o handler `confirmar` chama `await confirmarCliente(conversa.fio, conversa.clienteDoConvite)`", () => {
    const corpo = corpoDoCartao();
    const inicioDoHandler = corpo.indexOf("const confirmar = async () => {");
    expect(inicioDoHandler).toBeGreaterThan(-1);
    const fimDoHandler = corpo.indexOf("};", inicioDoHandler);
    const handler = corpo.slice(inicioDoHandler, fimDoHandler);

    expect(handler).toContain("await confirmarCliente(conversa.fio, conversa.clienteDoConvite)");
  });

  it("⛔ o clientId mandado é SEMPRE conversa.clienteDoConvite — nunca um valor lido de input/select", () => {
    const corpo = corpoDoCartao();
    expect(corpo).not.toContain("<select");
    expect(corpo).not.toContain("<input");
  });

  it("no sucesso (r.ok), o handler chama aoRecarregar()", () => {
    const corpo = corpoDoCartao();
    const inicioDoHandler = corpo.indexOf("const confirmar = async () => {");
    const fimDoHandler = corpo.indexOf("};", inicioDoHandler);
    const handler = corpo.slice(inicioDoHandler, fimDoHandler);

    const inicioDoIf = handler.indexOf("if (r.ok)");
    expect(inicioDoIf).toBeGreaterThan(-1);
    const trechoDoIf = handler.slice(inicioDoIf, handler.indexOf("} else {", inicioDoIf));
    expect(trechoDoIf).toContain("aoRecarregar();");
  });

  it("o JSX liga o botão ao handler: onClick chama confirmar()", () => {
    const corpo = corpoDoCartao();
    expect(corpo).toContain("onClick={() => void confirmar()}");
    expect(corpo).toContain("Confirmar que é deste cliente");
  });
});

describe("SecaoConversasParadas passa aoRecarregar={onTentarDeNovo} para cada cartão — a MESMA função que a falha de leitura usa", () => {
  it("o map de cartões recebe aoRecarregar={onTentarDeNovo}", () => {
    const inicio = PAGINA.indexOf("export function SecaoConversasParadas(");
    expect(inicio).toBeGreaterThan(-1);
    const fim = PAGINA.indexOf("\nfunction CartaoConversaParada(", inicio);
    const corpo = PAGINA.slice(inicio, fim);

    expect(corpo).toContain("<CartaoConversaParada key={c.fio} conversa={c} aoRecarregar={onTentarDeNovo} />");
  });
});
