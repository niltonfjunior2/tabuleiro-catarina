# AI EXECUTION GUIDE — TABULEIRO CATARINA 5 ANOS

Guia obrigatório para qualquer Agente de Inteligência Artificial ou desenvolvedor que atue na implementação, manutenção ou refatoração deste projeto.

---

## 1. REGRAS ARQUITETURAIS INVIOLÁVEIS

Qualquer alteração que viole os princípios abaixo será sumariamente rejeitada na auditoria:

1. **Separação Rígida entre Core Engine e UI:**
   * O diretório `src/core/` (ou `src/domain/`) NUNCA deve importar nada de `react`, `react-dom`, `@types/react`, APIs do DOM (`window`, `document`) ou bibliotecas de UI.
   * O Core Engine é 100% determinístico e testável de forma isolada com TypeScript puro.
2. **Zero Backend e Zero Dependências de Rede em Runtime:**
   * É terminantemente proibido adicionar chamadas `fetch` a APIs remotas, CDNs externos ou serviços de telemetria externos durante a execução da partida.
   * Todos os recursos (áudios, fontes, imagens, configurações) devem ser locais e embutidos no precache do Service Worker.
3. **Imutabilidade dos Dados das Casas:**
   * Os arquivos `board-coordinates.json` e `board-rules.json` representam a única fonte da verdade física e lógica do tabuleiro.
   * Coordenadas das casas são expressas em porcentagem `(0 a 100)` da largura e altura da imagem para garantir responsividade perfeita.
4. **Respeito aos Drivers de Qualidade:**
   * 1º Custo (zero), 2º Performance (60fps estável), 3º Resiliência Offline (PWA Cache-First).

---

## 2. PROCESSO DE IMPLEMENTAÇÃO DE FUNCIONALIDADES

Sempre que for solicitado implementar uma nova funcionalidade ou tarefa de Sprint:

1. **Consulta Prévia aos Artefatos:**
   * Ler `.ai/PROJECT_DNA.md` e `.ai/PRODUCT_BACKLOG.md`.
2. **Design em Camadas:**
   * Se a funcionalidade envolver regra de negócio (ex.: movimentação, cálculo de dados, verificação de vitória), implemente primeiro a lógica no domínio puro (`src/core/`).
   * Escreva ou atualize os testes unitários em `src/core/__tests__/`.
   * Garanta que os testes passem com 100% de sucesso.
   * Somente após a aprovação do teste de domínio, construa a integração visual na camada de apresentação (`src/components/`).
3. **Proteção de Acessibilidade Infantil:**
   * Toda nova interação deve ser acompanhada de feedback visual imediato e sem exigência de leitura de texto.

---

## 3. PROCESSO DE TESTES E QUALIDADE

Antes de considerar qualquer entrega concluída, o agente deve rodar a seguinte esteira de verificação:

1. **Verificação de Tipagem Estrita:**
   ```bash
   npm run typecheck # ou npx tsc --noEmit
   ```
   Zero erros permitidos. Não use `any` em hipótese alguma.
2. **Suíte de Testes Unitários:**
   ```bash
   npm run test # vitest run
   ```
   Todos os testes do Core Engine devem passar.
3. **Build de Produção:**
   ```bash
   npm run build
   ```
   O build deve concluir sem advertências críticas e o bundle final deve permanecer otimizado.

---

## 4. PROCESSO DE REVISÃO DE CÓDIGO (AUTO-AUDITORIA)

Durante a auto-revisão, o agente deve auditar:
* O componente renderiza corretamente sem layout shift (*CLS = 0*)?
* Há vazamento de memória com listeners de eventos ou instâncias do `AudioContext`?
* A tela de rotação (*Landscape Guard*) continua funcionando caso a orientação seja alterada?
* O Service Worker continua registrando e precacheando todos os novos arquivos adicionados?

---

## 5. PROCESSO DE DOCUMENTAÇÃO E SINCRONIA

* Se uma Sprint for concluída, o agente deve atualizar o `PRODUCT_BACKLOG.md` (marcando os critérios entregues) e o `IMPLEMENTATION_PLAN.md`.
* Nunca altere o `PROJECT_DNA.md` a menos que uma decisão arquitetural fundamental tenha sido expressamente autorizada pelo usuário.
* Ao final de cada ciclo, atualize o `README.md` raiz para refletir com exatidão como instalar, rodar e testar o projeto.

---

## 6. CHECKLIST DE CONCLUSÃO DE TAREFA (DEFINITION OF DONE)

- [ ] Código TypeScript estritamente tipado, sem uso de `any`.
- [ ] Regras de domínio isoladas e cobertas por testes unitários no Vitest.
- [ ] Interface validada em modo paisagem (*landscape*).
- [ ] Animações fluidas sem engasgos de frames.
- [ ] Recursos de áudio com controle de mute funcional.
- [ ] PWA validado offline (sem quebra sem conexão).
- [ ] Build de produção (`npm run build`) concluído com sucesso.
