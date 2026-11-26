# DIÁRIO DE ENGENHARIA — TABULEIRO CATARINA 5 ANOS

Registro contínuo de aprendizados técnicos, restrições descobertas, débitos e decisões de implementação.

---

## SPRINT 1 — FUNDAÇÃO E CORE ENGINE

### 1. Problemas Encontrados e Soluções
* **Problema 1: Inversão indevida de direção no Bate-e-Volta**
  * *Descrição:* Ao implementar a geração de passos passo a passo (`generateMoveSteps`), o peão que batia na Chegada (52) recuava para a 51, mas na iteração seguinte, como 51 < 52, a condição linear voltava a avançá-lo para 52 em loop.
  * *Causa:* Ausência de flag de controle unidirecional de recuo após atingir o limite da meta.
  * *Solução:* Introdução da flag booleana `isBouncing` que, uma vez ativada no toque da meta (quando há excedente no dado), trava o sentido estritamente para trás (`curr - 1`).
  * *Validação:* Detectado e sanado imediatamente na suíte de testes unitários do Vitest.

* **Problema 2: Peso excessivo da imagem de fundo**
  * *Descrição:* A imagem original do tabuleiro (`.ai/tabuleiro.jpg`) possuía 4.99 MB e resolução de 3543x2480px.
  * *Causa:* Exportação gráfica sem compressão para web.
  * *Solução:* Conversão automatizada via Python PIL com reamostragem Lanczos para 2560px de largura e compressão WebP de alta qualidade (82%).
  * *Resultado:* Arquivo final `public/assets/tabuleiro.webp` com **499.9 KB** (redução de ~90%), mantendo máxima nitidez retiniana para iPad e tablets.

---

### 2. Restrições Descobertas
* **Ambiente de Execução Windows/PowerShell:** O encadeamento de scripts de shell com `&&` não é suportado nativamente em versões legadas do PowerShell. As chamadas de automação devem encadear via `; if ($LASTEXITCODE -eq 0) { ... }` para máxima portabilidade em ambientes Windows.

---

### 3. Lições Aprendidas
* **O valor inegociável da Clean Architecture no Frontend:** O fato de termos implementado `src/core/engine.ts` e `src/core/types.ts` sem nenhuma linha de React ou DOM permitiu rodar 16 testes unitários em 5ms, descobrindo falhas lógicas e de ricochete antes de qualquer componente visual ser desenhado na tela.

---

### 4. Débitos Técnicos
* **Débito D-01: Calibração Final das Coordenadas (52 posições):** [RESOLVIDO NA SPRINT 2 ✓]
  * *Tratamento:* Mapeadas com precisão as 53 coordenadas percentuais em `src/data/board-coordinates.json`.

---

## SPRINT 2 — CAMADA VISUAL E INTERATIVIDADE BÁSICA

### 1. Problemas Encontrados e Soluções
* **Problema 1: Responsividade e Aspect Ratio Panorâmico**
  * *Descrição:* Ao renderizar em diferentes telas (ex.: tablets iPad 4:3 vs smartphones 19.5:9), a imagem do tabuleiro sofria distorção se não houvesse container com aspect ratio estrito.
  * *Solução:* Criação do container `aspect-[3543/2480]` centralizado dinamicamente dentro da viewport paisagem com `max-h-full max-w-full`.
* **Problema 2: Cognição Infantil e Cadência de Movimento**
  * *Descrição:* Um salto instantâneo da peça da casa de origem para a casa final impedia que crianças de 5 anos compreendessem quantos passos o dado gerou.
  * *Solução:* Orquestração com `setInterval` de 280ms por casa, permitindo que a criança conte verbalmente ("um, dois, três...").

### 2. Lições Aprendidas
* **Separação estrita entre Apresentação e Domínio:** A camada visual apenas orquestra o ritmo dos passos gerados pela função pura `generateMoveSteps`, mantendo a regra matemática desacoplada da taxa de quadros e timers do React.

### 3. Débitos Técnicos
* **Débito D-02: Efeitos Sonoros e Mute (Sprint 3):** [RESOLVIDO NA SPRINT 3 ✓]
  * *Tratamento:* Implementado `src/services/soundService.ts` com Web Audio API nativa e `src/components/AudioControl.tsx`.

---

## SPRINT 3 — CASAS ESPECIAIS, ÁUDIO E CELEBRAÇÃO COM FOGOS

### 1. Problemas Encontrados e Soluções
* **Problema 1: Restrição de Autoplay de Áudio em Navegadores Mobile**
  * *Descrição:* Navegadores modernos como Chrome e Safari iOS bloqueiam qualquer áudio antes do primeiro toque explícito do usuário.
  * *Solução:* Implementado método `soundService.unlock()` associado ao toque de início de jogo ("Começar Aventura!") e ao primeiro toque no botão do dado.
* **Problema 2: Sobrecarga de Arquivos de Áudio Externos**
  * *Descrição:* O carregamento de arquivos MP3 externos adicionaria centenas de kilobytes ao precache do PWA e traria risco de falhas de carregamento em redes lentas.
  * *Solução:* Criação de sintetizador procedural puro com Web Audio API gerando timbres suaves de caixinha de música/celesta com ondas senoidais e reverberação harmônica. Tamanho do código: < 4 KB, custo de download: 0 KB.
* **Problema 3: Impacto de Performance nos Fogos de Artifício**
  * *Descrição:* Animações pesadas de fogos em DOM nodes (centenas de divs) causariam queda de taxa de quadros (*FPS drop*) em celulares modestos.
  * *Solução:* Utilização da biblioteca `canvas-confetti` com renderização em elemento `<canvas>` acelerado por GPU e encerramento após 4.5 segundos.

### 2. Lições Aprendidas
* A Web Audio API procedural é uma solução de altíssima elegância para jogos infantis offline-first, eliminando dependências externas e garantindo que o áudio nunca falhe mesmo no Modo Avião.

### 3. Débitos Técnicos
* **Débito D-03: Persistência Local e Wake Lock (Sprint 4):** [RESOLVIDO NA SPRINT 4 ✓]
  * *Tratamento:* Implementado `src/services/storageService.ts` com auto-save em `localStorage` e `src/services/wakeLockService.ts` com reconexão automática.

---

## SPRINT 4 — PWA OFFLINE-FIRST, PERSISTÊNCIA LOCAL E DEPLOY VERCEL

### 1. Problemas Encontrados e Soluções
* **Problema 1: Revogação de Screen Wake Lock na Troca de Aplicativos**
  * *Descrição:* No Android e iOS, quando a criança ou os pais alternavam rapidamente de app ou a tela ficava inativa por um instante, a trava do `wakeLock` era liberada pelo sistema operacional.
  * *Solução:* Implementado o ouvinte `visibilitychange` no `wakeLockService`, readquirindo a trava automaticamente assim que a página volta a ser visível (`document.visibilityState === 'visible'`).
* **Problema 2: Invalidação de Cache do PWA após Novos Deploys**
  * *Descrição:* Em aplicações com Service Worker agressivo, atualizações na Vercel podem demorar a refletir se o `sw.js` for cacheado com tempo longo pelo navegador.
  * *Solução:* Configuração no `vercel.json` com cabeçalho estrito `Cache-Control: public, max-age=0, must-revalidate` para `/sw.js`, associado ao modo `registerType: 'autoUpdate'` do `vite-plugin-pwa`.

### 2. Lições Aprendidas
* O uso de testes unitários isolados para serviços de infraestrutura (como `storageService.test.ts`) valida a integridade do JSON de save/load sem depender do navegador físico aberto.

### 3. Débitos Técnicos
* **Status de Débitos Técnicos do Projeto:** **ZERO DÉBITOS PENDENTES ✓**
* Todas as 4 Sprints foram entregues, todos os critérios de aceite do backlog foram atendidos e a esteira de CI/CD está 100% verde.
