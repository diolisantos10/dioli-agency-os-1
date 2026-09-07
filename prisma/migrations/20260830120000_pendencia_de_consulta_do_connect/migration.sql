-- Dioli Connect: onde a resposta do gerente pousa quando ela volta (passo 8).
-- Nenhuma coluna de política: a memória de decisão é do núcleo, não do produto.
CREATE TABLE "PendenciaDeConsulta" (
    "protocolo" TEXT NOT NULL PRIMARY KEY,
    "produto" TEXT NOT NULL,
    "conversa" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "agente" TEXT NOT NULL,
    "fio" TEXT,
    "assunto" TEXT NOT NULL,
    -- PENDENTE | AGUARDANDO_ENVIO | RESPONDIDA | ENCERRADA
    "estado" TEXT NOT NULL DEFAULT 'PENDENTE',
    "avisadoEm" DATETIME,
    "respondidaEm" DATETIME,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "PendenciaDeConsulta_conversa_estado_idx" ON "PendenciaDeConsulta"("conversa", "estado");
