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

---

## REVISÃO E AJUSTES PÓS-HOMOLOGAÇÃO — SINCRONIZAÇÃO DO DADO E BOTÃO DE INSTALAÇÃO PWA

### 1. Problemas Encontrados e Soluções
* **Problema 1: Sorteio Duplicado e Dessincronia Visual do Dado**
  * *Descrição:* O peão avançava um número de casas diferente do que aparecia desenhado na face do dado.
  * *Causa:* O componente `DiceControl` sorteava números aleatórios para sua animação interna e, ao concluir, o `App.tsx` sorteava um segundo número aleatório independente para a movimentação física da peça. Além disso, o caractere Unicode original (`⚀`, etc.) era de difícil leitura em telas mobile.
  * *Solução:* Centralização do sorteio no `DiceControl`, repassando o número definitivo via callback `onRoll(rolledNumber)` para o `App.tsx`. Redesenho completo da face do dado em formato de cubo físico com pontos reais (pips em grade 3x3) e um crachá numérico arábico de alta nitidez.
* **Problema 2: Sobreposição na Barra de Ferramentas do Calibrador**
  * *Descrição:* Ao acionar o calibrador, o texto da próxima casa ficava oculto sob os botões de ação do topo esquerdo.
  * *Solução:* Inserção de espaçamento à esquerda (`pl-56 sm:pl-64`) e botão explícito de fechar no `CoordinatePicker`.
* **Problema 3: Instalação Manual de PWA Não Intuitiva em Dispositivos Móveis**
  * *Descrição:* Usuários comuns nem sempre conhecem o menu de três pontos do navegador para instalar um PWA, e no iOS Safari a API `beforeinstallprompt` inexiste.
  * *Solução:* Criação do componente `InstallPWAButton` que captura `beforeinstallprompt` (Android/Desktop) e exibe guia visual ilustrado de 3 passos para Safari iOS. O botão se auto-oculta quando o app é aberto em modo standalone.

### 2. Lições Aprendidas
* Nunca realizar sorteios aleatórios de forma desacoplada entre a camada visual e o estado de domínio. O número do dado deve ser uma fonte única da verdade compartilhada diretamente com o loop de movimentação.

### 3. Débitos Técnicos
* **Status:** **ZERO DÉBITOS PENDENTES ✓**

---

## MANUTENÇÃO CONTÍNUA (RAG) — OTIMIZAÇÕES MOBILE LANDSCAPE E DOCK LATERAL DO DADO

### 1. Problemas Encontrados e Soluções
* **Problema 1: Incompatibilidade de Altura dos Modais em Smartphones em Modo Paisagem**
  * *Descrição:* Em smartphones na horizontal, a altura útil de tela é reduzida (~300px a 370px). A janela inicial de escolha dos jogadores ficava cortada nas bordas e sem barra de rolagem.
  * *Causa:* Uso de classes de altura estática sem contenção vertical nem diretiva `overflow-y-auto`.
  * *Solução:* Aplicação de `max-h-[92dvh] overflow-y-auto` e distribuição dos cards de jogadores em grade de 2 colunas responsivas (`grid-cols-1 sm:grid-cols-2`) nos modais `PlayerSetupModal`, `SpecialEventModal` e `VictoryModal`.
* **Problema 2: Oclusão das Casas 36-39 pelo Botão Flutuante do Dado no Canto Inferior Direito**
  * *Descrição:* Em smartphones com viewport panorâmica, o controle do dado posicionado de forma absoluta no canto inferior direito cobria as casas 36 a 39 do tabuleiro.
  * *Causa:* Posicionamento `absolute bottom-2 right-2` sobreposto à imagem do tabuleiro.
  * *Solução:* Reestruturação do layout no `App.tsx` para um fluxo flex horizontal (`flex-row`), alocando o `DiceControl` em uma coluna lateral dedicada (`aside` dock direita). O tabuleiro permanece centralizado e desobstruído com seu aspect ratio preservado, e o dado fica comodamente acessível para o polegar direito dos jogadores.
* **Problema 3: Oclusão das Casas Superiores (22-24, 12-14, 25-26) por Elementos Flutuantes no Topo**
  * *Descrição:* Em celulares na horizontal, os botões auxiliares (`Reiniciar`, `Instalar`, etc.), o crachá de notificação e o controle de áudio, todos com `absolute top-2`, flutuavam diretamente sobre as casas da borda superior do tabuleiro.
  * *Causa:* Coexistência de elementos absolutos sobrepostos à viewport que também era preenchida pelo tabuleiro.
  * *Solução:* Criação de um `<header>` dedicado (`h-8 sm:h-9`) no fluxo vertical flex do `App.tsx`. Os botões, a notificação com `truncate` e o áudio foram embutidos no cabeçalho, enquanto o `<main>` e o `BoardView` ocupam estritamente o espaço restante (`flex-1 min-h-0`) com `aspectRatio: 3543 / 2480` e `max-h-full max-w-full`. Dessa forma, o tabuleiro e os controles passam a residir em linhas flex distintas e não sobrepostas, eliminando 100% de qualquer interferência visual.

### 2. Lições Aprendidas
* Em interfaces de jogos mobile orientados a landscape, nunca utilizar posicionamentos flutuantes `absolute` que compartilhem a mesma área que o canvas/tabuleiro. Um layout estruturado em cabeçalho superior (`header`), palco central (`main`) e dock lateral (`aside`) garante isolamento geométrico absoluto contra qualquer sobreposição, independentemente da proporção de tela do dispositivo.

### 3. Débitos Técnicos
* **Status:** **ZERO DÉBITOS PENDENTES ✓**

---

## MANUTENÇÃO CONTÍNUA (RAG) — RE-BRANDING E ATUALIZAÇÃO FORÇADA DE INSTALAÇÕES PWA

### 1. Problemas Encontrados e Soluções
* **Problema 1: Atualização de Nomenclatura Oficial da Marca**
  * *Descrição:* A nomenclatura oficial do jogo e dos seus metadados de instalação precisava ser alterada de "Tabuleiro Catarina 5 Anos" para "Cat no Reino dos Unicórnios".
  * *Solução:* Atualização de `<title>`, meta tags (`application-name`, `apple-mobile-web-app-title`), manifesto PWA (`name`, `short_name`), título do modal inicial, mensagem de alerta de rotação de tela, tela de vitória e nome padrão do primeiro peão (`Cat`).
* **Problema 2: Propagação de Atualização para Dispositivos com PWA Já Instalado**
  * *Descrição:* Aparelhos que já haviam instalado o PWA poderiam demorar para refletir o novo nome e as novas configurações devido ao ciclo passivo do navegador (até 24 horas para checagem de Service Worker).
  * *Solução:* Configuração do Workbox com `cleanupOutdatedCaches: true`, `clientsClaim: true` e `skipWaiting: true` no `vite.config.ts`, combinada com um trigger imperativo em `src/main.tsx` que executa `registration.update()` no arranque e recarrega a página ao disparar `controllerchange`.

### 2. Lições Aprendidas
* Disparar `registration.update()` no ciclo inicial de inicialização (`navigator.serviceWorker.ready`) assegura que o navegador consulte o servidor imediatamente em busca de novas versões do `sw.js` e do `manifest.webmanifest`, permitindo atualizações de PWA quase instantâneas.

### 3. Débitos Técnicos
* **Status:** **ZERO DÉBITOS PENDENTES ✓**

---

## MANUTENÇÃO CONTÍNUA (RAG) — FLUXO DE INSTALAÇÃO VIA QR CODE E AJUSTE DE COPY

### 1. Problemas Encontrados e Soluções
* **Problema 1: Restrição de Segurança de Navegadores para Instalação Direta via QR Code**
  * *Descrição:* Navegadores Android e iOS bloqueiam por segurança qualquer tentativa de instalar um PWA sem um gesto de toque explícito do usuário (*User Gesture Requirement*).
  * *Solução:* Criação do fluxo de 1-toque com o parâmetro `?install=1` no link do QR Code (`https://cat-no-reino-dos-unicornios.vercel.app/?install=1`). No Android, o app exibe uma tela de boas-vindas com botão destacado "Instalar Agora no Celular" que aciona o `deferredPrompt.prompt()`. No iOS Safari, exibe imediatamente o guia visual de 3 etapas para adicionar à tela de início. O parâmetro é limpo da URL via `history.replaceState` após a interação.
* **Problema 2: Geração de QR Code em Alta Resolução para Impressão**
  * *Descrição:* Necessidade de material físico para a festa com QR Code nítido e de fácil leitura por qualquer câmera de smartphone.
  * *Solução:* Geração do arquivo `public/assets/qrcode-cat-no-reino-dos-unicornios.png` (980x980px, 300 DPI, correção de erros nível H) apontando diretamente para o link com o parâmetro de instalação.
* **Problema 3: Ajuste de Copywriting Solicitado**
  * *Descrição:* Atualização do subtítulo no modal inicial de "Aniversário de 5 Anos no Reino dos Unicórnios!" para "Divirta-se no aniversário de 5 anos da Catarina".
  * *Solução:* Alteração direta no `PlayerSetupModal.tsx` e reflexo nas mensagens do modal de instalação.

### 2. Lições Aprendidas
* Combinar query parameters (`?install=1`) com a verificação de `window.matchMedia('(display-mode: standalone)')` permite criar experiências de recepção diferenciadas para novos visitantes vindos de QR Codes físicos, sem interferir na experiência de quem já joga com o app instalado.

### 3. Débitos Técnicos
* **Status:** **ZERO DÉBITOS PENDENTES ✓**

---

## MANUTENÇÃO CONTÍNUA (RAG) — MÓDULO SOBRE, TERMOS DE USO & HOMENAGEM DO VOVÔ NILTON

### 1. Problemas Encontrados e Soluções
* **Problema 1: Inclusão Discreta de Autoria Afetiva e Termos Mágicos**
  * *Descrição:* Necessidade de eternizar que o jogo é um presente criado com amor pelo Vovô Nilton para a Catarina, acompanhado de termos de uso e privacidade leves e divertidos, sem poluir a interface visual de jogo das crianças.
  * *Solução:* Criação do componente `AboutModal.tsx` com foto redonda do Vovô Nilton (`public/assets/vovo.jpeg`), termos lúdicos de consentimento dos unicórnios, garantia de privacidade total offline e botão discreto `?` no canto superior direito do cabeçalho.

### 2. Lições Aprendidas
* Projetos afetivos com forte valor emocional ganham imensa personalidade quando as informações institucionais/termos são convertidas em storytelling lúdico integrado à temática mágica do jogo.

### 3. Débitos Técnicos
* **Status:** **ZERO DÉBITOS PENDENTES ✓** (Repositório limpo, 19/19 testes aprovados, build atualizado no GitHub).
