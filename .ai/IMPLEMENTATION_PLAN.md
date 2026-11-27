# IMPLEMENTATION PLAN — TABULEIRO CATARINA 5 ANOS

Plano tático de execução estruturado em Sprints incrementais para mitigar riscos técnicos antecipadamente e garantir a entrega com total confiabilidade antes do aniversário da Catarina.

---

## 1. VISÃO GERAL DO ROADMAP

O projeto é dividido em **4 Sprints Sequenciais**:

```
[SPRINT 1: Fundação & Core Engine] 
       │ (Regras Puras, FSM, Vitest 100%, JSON de Coordenadas)
       ▼
[SPRINT 2: Camada Visual & Interatividade] 
       │ (Tabuleiro Responsivo, Landscape Guard, Tokens Animados, Rolagem de Dados)
       ▼
[SPRINT 3: Regras Especiais, Celebração & Áudio] 
       │ (Casas Especiais, Bate-e-Volta, Fogos de Artifício, Trilha Sonora com Mute)
       ▼
[SPRINT 4: PWA Offline, Persistência & Deploy Vercel] 
       │ (Service Worker Cache-First, localStorage, CI/CD GitHub + Vercel, Auditoria Final)
       ▼
[CICLO DE HOMOLOGAÇÃO & SUSTENTAÇÃO MOBILE (RAG)]
       │ (Doca Lateral do Dado, Header Superior Desobstruído, Modais Landscape, Instalação PWA)
```

---

## 2. DETALHAMENTO DAS SPRINTS

### SPRINT 1: Fundação Arquitetural, Estrutura e Core Engine [STATUS: CONCLUÍDA ✓]
* **Objetivo:** Estabelecer a base do projeto com TypeScript + Vite e implementar o motor de regras de domínio puro desacoplado com 100% de testes automatizados.
* **Tarefas Técnicas:**
  1. Setup do projeto com Vite + React + TypeScript + Vitest + TailwindCSS/PostCSS. [CONCLUÍDO]
  2. Otimização de assets: conversão da imagem original `tabuleiro.jpg` (4.9 MB) para formato WebP de alta qualidade (< 500 KB) em `public/assets/tabuleiro.webp`. [CONCLUÍDO]
  3. Criação de utilitário dev `CoordinatePicker` para calibrar interativamente as porcentagens `(x, y)` das casas 0 (Largada) a 51 + Chegada (52) gerando `src/data/board-coordinates.json`. [CONCLUÍDO]
  4. Criação do arquivo `src/data/board-rules.json` especificando as regras das casas especiais. [CONCLUÍDO]
  5. Implementação das entidades de domínio puras (`Player`, `GameState`, `Board`, `MoveResult`). [CONCLUÍDO]
  6. Implementação da FSM (*Finite State Machine*) do jogo: controle de turnos, rolagem de dados, cálculo de passos, tratamento de colisão amigável. [CONCLUÍDO]
  7. Suíte de testes unitários com Vitest cobrindo todos os cenários matemáticos de movimento (16/16 aprovados). [CONCLUÍDO]
* **Marco de Entrega (Milestone 1):** Motor do jogo funcionando em memória e validado por testes automatizados sem falhas. [ALCANÇADO ✓]

---

### SPRINT 2: Visualização do Tabuleiro, Tokens e Interação Básica [STATUS: CONCLUÍDA ✓]
* **Objetivo:** Renderizar a arte do tabuleiro em alta definição, garantir proporção panorâmica, desenhar os peões animados e permitir a primeira partida funcional na tela.
* **Tarefas Técnicas:**
  1. Criação do componente `LandscapeGuard` (bloqueio amigável orientando rotação caso o dispositivo esteja em modo retrato). [CONCLUÍDO]
  2. Implementação do `BoardView` responsivo (mantendo proporção exata da imagem `tabuleiro.jpg` convertida em WebP otimizada). [CONCLUÍDO]
  3. Mapeamento das 53 coordenadas percentuais do percurso em `board-coordinates.json`. [CONCLUÍDO]
  4. Renderização dos pinos dos jogadores (Rosa, Lilás, Amarelo, Turquesa) posicionados sobre as casas via coordenadas percentuais. [CONCLUÍDO]
  5. Algoritmo de dispersão de múltiplas peças na mesma casa para visualização clara de todos os jogadores. [CONCLUÍDO]
  6. Componente interativo do Dado (`DiceControl`) com animação de giro e acionamento no toque. [CONCLUÍDO]
  7. Animação de caminhada da peça casa a casa (*hop step* sequencial). [CONCLUÍDO]
  8. Modal de seleção inicial de participantes de 1 a 4 jogadores (`PlayerSetupModal`). [CONCLUÍDO]
* **Marco de Entrega (Milestone 2):** Partida jogável de 1 a 4 jogadores movendo-se pelo tabuleiro do início ao fim com visualização precisa. [ALCANÇADO ✓]

---

### SPRINT 3: Casas Especiais, Áudio e Celebração com Fogos [STATUS: CONCLUÍDA ✓]
* **Objetivo:** Adicionar toda a magia lúdica para as crianças de 5 anos: automação dos eventos das casas especiais, efeitos sonoros, música suave e fogos na vitória.
* **Tarefas Técnicas:**
  1. Integração da regra da Casa 9 (avanço de 5 casas). [CONCLUÍDO]
  2. Integração da Casa 13 (minigame automático de sorte com dado de par/ímpar). [CONCLUÍDO]
  3. Integração da Casa 22 (penalidade visual de foto com unicórnio / pula 1 rodada). [CONCLUÍDO]
  4. Integração das Casas 29 (soninho até 35), 40 (atalho +4) e 48 (corrida para a chegada). [CONCLUÍDO]
  5. Componente `SpecialEventModal` com ícones gigantes e descrições para crianças. [CONCLUÍDO]
  6. Efeito visual exuberante de fogos de artifício e confetes na vitória (`VictoryModal` com `canvas-confetti`). [CONCLUÍDO]
  7. Sistema de som e trilha procedural com `Web Audio API` (`soundService` e `AudioControl` com botão de mute). [CONCLUÍDO]
* **Marco de Entrega (Milestone 3):** Jogo completo com todas as regras do tabuleiro físico, animações e ambientação sonora. [ALCANÇADO ✓]

---

### SPRINT 4: PWA Offline-First, Persistência Local e Deploy Vercel [STATUS: CONCLUÍDA ✓]
* **Objetivo:** Blindar a aplicação para operação 100% offline em locais sem internet, persistir o progresso e preparar para deploy na Vercel via GitHub.
* **Tarefas Técnicas:**
  1. Configuração do `vite-plugin-pwa` com Workbox e precache de todos os assets (HTML, JS, CSS, WebP, ícones e JSONs). [CONCLUÍDO]
  2. Criação do `manifest.webmanifest` com ícones gerados (192x192 e 512x512) e orientação `landscape`. [CONCLUÍDO]
  3. Implementação de auto-save e restauração de partida via `storageService` no `localStorage` com opção "Continuar Jogo Salvo". [CONCLUÍDO]
  4. Ativação da `Screen Wake Lock API` via `wakeLockService` para manter a tela do tablet/celular ativa durante a partida sem suspensão acidental. [CONCLUÍDO]
  5. Configuração de cabeçalhos de segurança e cache otimizado em `vercel.json`. [CONCLUÍDO]
  6. Pipeline de CI/CD automatizado via GitHub Actions em `.github/workflows/ci.yml`. [CONCLUÍDO]
  7. Bateria de testes de persistência unitários no Vitest (19/19 testes aprovados). [CONCLUÍDO]
* **Marco de Entrega (Milestone 4):** Produto final em padrão de produção, preparado para deploy na Vercel e instalação como PWA 100% offline para o aniversário da Catarina. [ALCANÇADO ✓]

---

### CICLO DE HOMOLOGAÇÃO & SUSTENTAÇÃO MOBILE (RAG) [STATUS: CONCLUÍDO ✓]
* **Objetivo:** Refinamento ergonômico pós-deploy em produção real mobile para garantir que nenhum elemento visual ou controle sobreponha o tabuleiro ou quebre a rolagem em telas pequenas.
* **Tarefas Técnicas:**
  1. Reestruturação do controle do dado para doca lateral dedicada (`aside` em `flex-row`), desobstruindo as casas 36 a 39. [CONCLUÍDO]
  2. Implementação de cabeçalho superior formal (`<header>`), transferindo botões e notificações flutuantes e desobstruindo as casas 12-14, 22-24 e 25-26. [CONCLUÍDO]
  3. Contenção vertical e rolagem (`max-h-[92dvh] overflow-y-auto`) nos modais de participantes, regras especiais e vitória para celulares em modo paisagem. [CONCLUÍDO]
  4. Sincronização do sorteio do dado com renderização de cubo 3D com pips físicos e badge de numeração arábica. [CONCLUÍDO]
  5. Componente de instalação guiada PWA (`InstallPWAButton`) com suporte a Android e modal explicativo para iOS Safari. [CONCLUÍDO]
  6. Substituição dos ícones PWA e favicon oficial a partir da arte de unicórnio `.ai/ícone.jpg`. [CONCLUÍDO]
* **Marco de Entrega (Milestone 5 - Homologação Final):** Jogo 100% calibrado, polido e testado em produção mobile, sem nenhuma sobreposição de elementos na malha de casas e com zero dependências externas. [ALCANÇADO ✓]

---

## 3. MATRIZ DE DEPENDÊNCIAS
* Sprint 2 depende da Sprint 1 (Visual consome o Core Engine e as coordenadas JSON).
* Sprint 3 depende da Sprint 2 (Eventos especiais e celebração são disparados sobre o tabuleiro visual).
* Sprint 4 depende da Sprint 3 (O PWA empacota e precacheia todo o conjunto final de assets e áudios).
