# PROJECT DNA — TABULEIRO CATARINA 5 ANOS

## 1. Visão do Projeto
O **Tabuleiro Catarina 5 Anos** é uma aplicação web progressiva (PWA) interativa, mobile-first e 100% offline-first, criada especificamente para ser a atração lúdica do aniversário de 5 anos da Catarina. Trata-se de uma digitalização fiel e imersiva do jogo de tabuleiro físico temático de unicórnios, permitindo que até 4 participantes (crianças e familiares) joguem presencialmente no mesmo dispositivo (celular ou tablet), compartilhando a tela em modo paisagem (*pass-and-play*). O jogo guia as crianças com automação 100% visual, efeitos sonoros amigáveis, trilha musical relaxante e celebração com fogos de artifício na vitória.

---

## 2. Objetivos
* **Objetivo Primário:** Proporcionar uma experiência de entretenimento acessível, intuitiva e sem atrito para crianças de 5 anos e familiares durante o evento comemorativo.
* **Objetivo de Disponibilidade:** Operar com 100% de autonomia e resiliência offline, garantindo que o jogo não trave ou falhe mesmo na ausência de sinal de internet.
* **Objetivo de Custo:** Custo operacional zero de infraestrutura e hospedagem permanente.
* **Objetivo de Fidelidade de Regras:** Reproduzir com precisão matemática e lógica todas as 51 casas, eventos especiais dos balões e a regra de vitória do tabuleiro original.

---

## 3. Drivers Arquiteturais (Priorização Ordenada)
1. **Custo (Prioridade 1):** R$ 0,00 de custo operacional. Arquitetura 100% estática *Client-Side* sem dependência de banco de dados pago ou servidores de aplicação dedicados.
2. **Performance e Fluidez (Prioridade 2):** Renderização estável a 60 FPS em celulares e tablets, garantindo animações suaves das peças percorrendo o caminho e transições agradáveis para os olhos de crianças pequenas.
3. **Disponibilidade / Resiliência (Prioridade 3):** Tolerância zero à falta de rede. Cache-first agressivo via Service Worker garantindo execução offline absoluta.
4. **Tempo de Entrega (Prioridade 4):** Foco em simplicidade arquitetural e reutilização de padrões sólidos para garantir entrega antecipada antes da data da festa de aniversário.
5. **Manutenibilidade (Prioridade 5):** Código modularizado, tipagem estrita com TypeScript e separação clara entre a máquina de estados do jogo (*Core Engine*) e a camada visual (*Presentation*).

---

## 4. Restrições Invioláveis
* **Hospedagem e CI/CD:** Repositório no GitHub e deploy contínuo automatizado na Vercel.
* **Sem Backend / Zero Servidor de Aplicação:** Toda a execução de regras e estado ocorre no navegador cliente.
* **Armazenamento e Configuração em JSON:** Regras das casas, coordenadas relativas do tabuleiro e metadados devem residir em arquivos `.json` versionados.
* **Otimização de Assets Obrigatória:** A imagem original `tabuleiro.jpg` (4.9 MB) deve ser otimizada e convertida para WebP responsivo (< 500 KB) para permitir download instantâneo no primeiro acesso antes do cache.
* **Wake Lock API para Telas Infantis:** Utilizar a Screen Wake Lock API para impedir que a tela do tablet/celular apague por inatividade durante a partida.
* **Mobile First em Modo Paisagem (*Landscape*):** A visualização do tabuleiro completo é horizontal. Caso o aparelho seja segurado em modo retrato (*portrait*), uma tela amigável instrui a rotação do aparelho.
* **Público de 5 Anos:** Zero exigência de leitura de texto. O jogo deve comunicar avanços, recuos, bloqueios e vitórias de forma 100% visual, intuitiva e com feedbacks auditivos.
* **Autonomia Offline:** Nenhuma requisição a CDNs ou APIs externas em tempo de execução de partida.

---

## 5. Decisões por Dimensão

### Dimensão 1 — Escopo e Propósito
* **Natureza:** Sistema de entretenimento pontual para evento crítico (aniversário infantil), com potencial de reutilização contínua pela família.
* **Critério de Sucesso:** Partida completa iniciada, jogada e vencida sem interrupções técnicas ou frustração de usabilidade pelas crianças.

### Dimensão 2 — Domínio de Negócio
* **Entidades Centrais:** `Jogo`, `Jogador` (1 a 4 jogadores, cores distintas), `Tabuleiro` (51 casas + Largada + Chegada), `Dado` (1 a 6), `CasaEspecial` (eventos de salto, penalidade, sorte).
* **Mapeamento Exato das Casas Especiais:**
  * **Casa 9:** *"Melhores amigos! Avance 5 casas"* (move para a casa 14).
  * **Casa 13:** *"Sorte no dado!"* (dispara uma rolagem automática de verificação: ímpar avança 3 casas para a 16; par recua 3 casas para a 10).
  * **Casa 22:** *"Foto com unicórnio!"* (jogador recebe status `skipNextTurn = true`, perdendo a próxima rodada).
  * **Casa 29:** *"Soninho revigorante!"* (salta direto para a casa 35).
  * **Casa 40:** *"Atalho!"* (avança 4 casas para a 44).
  * **Casa 48:** *"Corrida linda!"* (salta direto para a Chegada).
* **Estrutura de Indexação das Casas:**
  * Posição 0: `LARGADA` (círculo azul inferior esquerdo).
  * Posições 1 a 51: Casas numeradas do percurso.
  * Posição 52: `CHEGADA` (círculo azul superior direito, meta final de vitória).
* **Colisão:** Amigável. Peças na mesma casa se acomodam em um arranjo visual em sub-posições (grid 2x2 com micro-offsets) sem expulsão de jogadores.
* **Vitória e Regra do Bate-e-Volta:** Exigência de valor exato para pousar na Chegada (posição 52). 
  * Exemplo matemático: Estando na casa 50, a distância para a Chegada (52) é de 2 passos. Se tirar 4 no dado, o peão avança 2 passos até a Chegada (passos 1 e 2) e ricocheteia 2 passos para trás (passos 3 e 4), finalizando na casa 50. Apenas alcançando exatamente a posição 52 sem sobras ocorre a vitória. Fogos de artifício e fanfarra celebram o vencedor.

### Dimensão 3 — Restrições Não Negociáveis
* Suporte nativo PWA com Web App Manifest e Service Worker (Cache-First).

### Dimensão 4 — Atores e Segurança
* **Perfis:** Jogadores locais convidados (sem login, sem senhas, sem dados pessoais sensíveis em conformidade com LGPD infantil).

### Dimensão 5 — Experiência de Uso
* Interface panorâmica com a arte oficial de fundo (`tabuleiro.jpg`).
* Destaque visual brilhante do jogador ativo da rodada.
* Botão de rolagem de dado com área de toque ampla para dedos infantis.
* Feedback visual de "dado girando" e movimentação da peça casa por casa (*step-by-step*) para que a criança acompanhe a contagem numérica visualmente.
* Controle de trilha sonora suave com botão de ativação/mudo acessível.

### Dimensão 6 — Dados
* Arquivos JSON estáticos para definição de mapa e regras.
* `localStorage` para retenção do estado da partida em andamento (se o navegador fechar ou recarregar acidentalmente, a partida pode ser retomada exatamente do ponto em que parou).

### Dimensão 7 — Processamento
* Processamento leve no cliente. Motor FSM puro acionado por eventos de entrada (toque no dado).

### Dimensão 8 — Conectividade e Resiliência
* App Shell pré-cacheado na instalação do PWA.
* Áudios e imagens carregados a partir do cache local.

### Dimensão 9 — Ecossistema Externo
* Zero dependência externa de serviços pagos ou APIs de terceiros.

### Dimensão 10 — Cultura Técnica
* Stack moderna, padronizada e de fácil manutenção: React com TypeScript e Vite.

### Dimensão 11 — Operação e Observabilidade
* Logs de console estruturados em modo de desenvolvimento (`__DEV__`).
* Monitoramento de erros de runtime com *Error Boundaries* que impedem tela branca.

### Dimensão 12 — Atributos de Qualidade
* **Tempo de Carga:** < 1.5s após cache PWA.
* **Latência de Interação:** Resposta imediata ao toque (< 50ms).

---

## 6. Arquitetura Lógica

A arquitetura adota o padrão **Clean Architecture / Hexagonal Client-Side**:

```
+-------------------------------------------------------------+
|                     PRESENTATION LAYER                      |
|  - LandscapeContainer (Lock/Rotate Warning)                 |
|  - BoardView (Responsive Canvas/SVG Coordinate Overlay)     |
|  - PlayerTokens (Spring Animation, Multi-Token Offsets)     |
|  - DiceComponent (3D/2D Animated Roll, Touch Target)        |
|  - AudioControls (Music Toggle, SFX Trigger)                |
|  - VictoryCelebration (Canvas Confetti, Audio Fanfare)      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     APPLICATION LAYER                       |
|  - GameStateMachine (Turn Flow, Move Orchestrator)          |
|  - AudioService (Web Audio Context & Unlock Manager)        |
|  - PersistenceService (Auto-Save/Restore to localStorage)   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     DOMAIN CORE ENGINE                      |
|  - Pure Domain Entities: Player, Board, Tile, MoveResult    |
|  - Rule Engine: StepCalculator, BounceBackRule, SpecialTiles|
|  - Zero dependencies on React, DOM, or Browser APIs         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    INFRASTRUCTURE / DATA                    |
|  - board-coordinates.json (X,Y % anchors for tiles 0..51)   |
|  - board-rules.json (Special tile events & behaviors)       |
|  - Service Worker (Workbox Cache-First Strategy)            |
+-------------------------------------------------------------+
```

---

## 7. Arquitetura Física
* **Hospedagem:** Vercel Global Edge CDN (Single Page Application distribuída mundialmente).
* **Artefatos Estáticos Gerados:**
  * `index.html` (Entrypoint)
  * `assets/app.[hash].js` e `assets/app.[hash].css`
  * `assets/tabuleiro.webp` (Arte otimizada com alta nitidez)
  * `assets/audio/` (Trilha de fundo em loop e sound effects de passos, dados, fogos)
  * `manifest.webmanifest` + Service Worker com precache completo.

---

## 8. Stack Tecnológica
* **Linguagem:** TypeScript 5.x (Tipagem estrita, modelos de domínio blindados).
* **Framework:** React 18+ (Componentização declarativa, estabilidade comprovada).
* **Build Tool:** Vite (Build ultrarrápido, otimização de bundles e suporte nativo a ESM).
* **PWA:** `vite-plugin-pwa` com Workbox (Geração automática de manifesto e Service Worker offline).
* **Efeitos Visuais:** `canvas-confetti` (Fogos de artifício e comemoração de alta performance com zero impacto na thread principal).
* **Áudio:** Web Audio API nativa com gerenciador de desbloqueio de interação (para contornar bloqueio de autoplay no Safari iOS e Chrome Android).
* **Testes Automatizados:** Vitest (Testes unitários de alta velocidade para o *Core Engine* de regras).

---

## 9. Estratégia de Segurança
* Conteúdo puramente estático sem cookies ou credenciais.
* Sem inputs de texto livre de usuários (proteção total contra XSS).
* Cabeçalhos de segurança Vercel: Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options.

---

## 10. Estratégia de Dados
* **Formato de Dados:** JSON estático imutável contendo:
  * ID da casa (0 = Largada, 1..51 = Casas, 52 = Chegada).
  * Coordenadas percentuais relativas `(x: float, y: float)` da imagem base para posicionamento responsivo e redimensionável das peças em qualquer resolução.
  * Metadados do tipo de evento da casa.
* **Estado Volátil:** Armazenado em memória React.
* **Estado Persistente de Recuperação:** Salvo a cada transição de turno em `localStorage` sob chave isolada `CATARINA_BOARD_GAME_STATE`.

---

## 11. Estratégia Operacional & Observabilidade
* Execução em modo estático cliente.
* Monitoramento de integridade via Testes Unitários de Integração das Regras antes do deploy.
* Tratamento gracioso de erro: se o áudio for bloqueado pelo sistema operacional, o jogo continua funcionando normalmente sem travar.

---

## 12. Riscos e Mitigações
1. **Risco de Bloqueio de Áudio em Mobile:** Navegadores bloqueiam áudio automático.
   * *Mitigação:* Inicialização e *resume* do `AudioContext` no primeiro clique do usuário ("Iniciar Jogo").
2. **Risco de Desorientação da Tela:** Usuário abrir o jogo na vertical.
   * *Mitigação:* Componente de *Orientation Guard* que sobrepõe uma animação suave solicitando girar o aparelho para a horizontal.
3. **Risco de Amontoamento de Peças na Mesma Casa:** Peças de jogadores diferentes ficarem invisíveis umas sobre as outras.
   * *Mitigação:* Algoritmo de dispersão de coordenadas com offset relativo dinâmico para até 4 peças na mesma casa.
4. **Risco de Recarregar a Página no Aniversário:** Perder a partida que as crianças estavam jogando.
   * *Mitigação:* Hidratação automática do estado via `localStorage` com opção na tela de "Continuar Jogo" ou "Novo Jogo".

---

## 13. Trade-offs Aceitos
* **Exclusividade Paisagem (Landscape):** Sacrifica a ergonomia com uma mão em modo retrato em favor da experiência autêntica e legibilidade integral do tabuleiro visual da Catarina.
* **Jogo Local (Single Device) vs Online Multi-Device:** Evita infraestrutura de WebSockets, servidores e custos de rede em prol de um jogo de mesa aconchegante, seguro para crianças e 100% offline.
