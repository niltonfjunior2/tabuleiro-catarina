# PRODUCT BACKLOG — TABULEIRO CATARINA 5 ANOS

Backlog estruturado e priorizado por valor de negócio, derivado diretamente da arquitetura definida em `PROJECT_DNA.md`.

---

## EPIC 1: CONFIGURAÇÃO DE JOGADORES E AMBIENTE (ONBOARDING)
**Objetivo:** Permitir que as crianças e responsáveis configurem a partida de forma imediata, visual e sem burocracia de cadastro.

### FEATURE 1.1: Tela Inicial e Seleção de Participantes
* **Prioridade:** Alta
* **Dependências:** Nenhuma

#### US-1.1.1: Seleção de Quantidade e Cores de Jogadores [CONCLUÍDO ✓]
* **Como** criança ou responsável,
* **Quero** escolher facilmente quantos jogadores vão participar (de 1 a 4) e ver a cor da peça de cada um (Rosa, Lilás, Amarelo, Turquesa),
* **Para que** cada criança se sinta representada na partida.
* **Critérios de Aceite:**
  1. Opção para selecionar 1, 2, 3 ou 4 participantes com botões visuais e cores temáticas. [ENTREGUE]
  2. Cada jogador recebe um identificador claro: Jogador 1 (Rosa), Jogador 2 (Lilás), Jogador 3 (Amarelo), Jogador 4 (Turquesa). [ENTREGUE]
  3. Botão destacado e atrativo "Começar Aventura!". [ENTREGUE]

#### US-1.1.2: Orientação de Tela e Alerta de Modo Paisagem [CONCLUÍDO ✓]
* **Como** jogador no celular ou tablet,
* **Quero** ser alertado caso o aparelho esteja em modo retrato,
* **Para que** eu gire a tela e desfrute do tabuleiro na proporção horizontal correta.
* **Critérios de Aceite:**
  1. Detecção automática de orientação (Portrait vs Landscape). [ENTREGUE]
  2. Se Portrait, sobrepor uma camada amigável com ilustração instruindo a girar o dispositivo. [ENTREGUE]
  3. Desaparecer automaticamente assim que o dispositivo for girado para Landscape. [ENTREGUE]

---

## EPIC 2: MOTOR DE REGRAS E TABULEIRO (CORE ENGINE)
**Objetivo:** Garantir a integridade absoluta da movimentação, contagem de casas, regras especiais e condições de vitória.

### FEATURE 2.1: Sistema de Coordenadas e Renderização do Tabuleiro
* **Prioridade:** Crítica
* **Dependências:** `board-coordinates.json`

#### US-2.1.1: Mapeamento de Casas Responsivas [CONCLUÍDO ✓]
* **Como** jogador,
* **Quero** ver as peças posicionadas com exatidão sobre os números desenhados no tabuleiro original,
* **Para que** a experiência visual corresponda com perfeição à imagem física.
* **Critérios de Aceite:**
  1. Coordenadas relativas percentuais `(x, y)` para as 51 casas, Largada (0) e Chegada (52). [ENTREGUE - 53 posições calibradas]
  2. Redimensionamento fluído mantendo a proporção da imagem independentemente da resolução da tela. [ENTREGUE]
  3. Offset automático e suave quando 2 a 4 peças estiverem ocupando a mesma casa. [ENTREGUE]

#### US-2.1.2: Ferramenta Interna de Calibração de Coordenadas (Dev Tool) [CONCLUÍDO ✓]
* **Como** desenvolvedor/IA implementador,
* **Quero** um modo de calibração em tempo de desenvolvimento onde clicar nas casas da imagem exibe e exporta suas coordenadas percentuais exatas,
* **Para que** o mapeamento das 52 posições do tabuleiro seja 100% preciso e sem adivinhação manual.
* **Critérios de Aceite:**
  1. Ativável apenas em modo `__DEV__` via flag ou atalho. [ENTREGUE em src/dev/CoordinatePicker.tsx]
  2. Permite clicar sequencialmente nas casas e gera o array JSON pronto para o `board-coordinates.json`. [ENTREGUE]

### FEATURE 2.2: Rolagem de Dado e Movimentação Passo a Passo
* **Prioridade:** Crítica
* **Dependências:** Feature 2.1

#### US-2.2.1: Rolagem Interativa do Dado [CONCLUÍDO ✓]
* **Como** criança jogando na sua vez,
* **Quero** tocar em um dado grande e visualizá-lo girando antes de revelar o número (1 a 6),
* **Para que** haja suspense lúdico e animação intuitiva.
* **Critérios de Aceite:**
  1. Botão de dado acessível com indicação evidente da cor do jogador da vez. [ENTREGUE]
  2. Animação de rotação com duração adequada (~1 segundo). [ENTREGUE]
  3. Geração verdadeiramente aleatória de valores entre 1 e 6. [ENTREGUE]

#### US-2.2.2: Caminhada Passo a Passo da Peça [CONCLUÍDO ✓]
* **Como** criança de 5 anos,
* **Quero** ver minha peça pulando de casa em casa até atingir o total do dado,
* **Para que** eu consiga acompanhar visualmente a contagem sem me perder.
* **Critérios de Aceite:**
  1. Animação sequencial com micro-salto (*hop*) a cada casa avançada. [ENTREGUE - 280ms/passo]
  2. Efeito sonoro discreto a cada salto de casa. [ENTREGUE via Web Audio API]
  3. Trava de interação durante o movimento para evitar toques acidentais múltiplos. [ENTREGUE]

### FEATURE 2.3: Automação das Casas Especiais
* **Prioridade:** Alta
* **Dependências:** US-2.2.2

#### US-2.3.1: Eventos de Salto Direto (Casas 9, 29, 40 e 48) [CONCLUÍDO ✓]
* **Como** jogador,
* **Quero** que ao cair em uma casa de bônus, minha peça seja movida automaticamente para o destino correto com destaque visual,
* **Para que** a regra seja aplicada sem exigir leitura.
* **Critérios de Aceite:**
  1. Casa 9: Exibe balão/animação temática e avança 5 casas até a 14. [ENTREGUE]
  2. Casa 29: Animação de soninho e voo direto até a casa 35. [ENTREGUE]
  3. Casa 40: Animação de atalho e avanço de 4 casas até a 44. [ENTREGUE]
  4. Casa 48: Animação de corrida acelerada direto para a Chegada. [ENTREGUE]

#### US-2.3.2: Casa 13 — Minigame da Sorte (Ímpar avança 3, Par volta 3) [CONCLUÍDO ✓]
* **Como** jogador caindo na casa 13,
* **Quero** que o jogo acione o dado especial de sorte e mostre o resultado (par ou ímpar) movendo minha peça,
* **Para que** a regra do tabuleiro seja cumprida de forma dinâmica.
* **Critérios de Aceite:**
  1. Ao aterrissar na casa 13, o dado é rolado novamente em destaque. [ENTREGUE]
  2. Se ímpar (1, 3, 5): avança 3 casas (casa 16). [ENTREGUE]
  3. Se par (2, 4, 6): volta 3 casas (casa 10). [ENTREGUE]

#### US-2.3.3: Casa 22 — Foto com Unicórnio (Fique 1 Rodada sem Jogar) [CONCLUÍDO ✓]
* **Como** jogador que caiu na casa 22,
* **Quero** ver o aviso visual com efeito de flash/foto e a indicação de que passarei uma rodada descansando,
* **Para que** na minha próxima vez a vez passe automaticamente sem confusão.
* **Critérios de Aceite:**
  1. Efeito visual de fotografia com som de clique. [ENTREGUE]
  2. Estado do jogador recebe penalidade de suspensão por 1 turno. [ENTREGUE]
  3. No turno seguinte, o sistema exibe aviso rápido e passa a vez para o próximo jogador. [ENTREGUE]

### FEATURE 2.4: Regra da Chegada Exata (Bate e Volta) e Vitória
* **Prioridade:** Crítica
* **Dependências:** US-2.2.2

#### US-2.4.1: Bate e Volta na Chegada [CONCLUÍDO ✓]
* **Como** jogador próximo à Chegada (meta = posição 52),
* **Quero** que se eu tirar um número maior do que o necessário, minha peça chegue na Chegada e volte as casas excedentes,
* **Para que** a regra oficial do jogo seja respeitada.
* **Critérios de Aceite:**
  1. Exemplo: se na casa 50 (distância 2 da meta 52) for tirado 4, a peça avança 2 até a Chegada (52) e recua 2 casas, parando na casa 50. [ENTREGUE]
  2. Somente a chegada exata consagra a vitória. [ENTREGUE]

#### US-2.4.2: Celebração de Vitória e Fogos de Artifício [CONCLUÍDO ✓]
* **Como** jogador vencedor,
* **Quero** uma explosão de fogos de artifício na tela, fanfarra musical e mensagem "Parabéns, Catarina / Jogador!",
* **Para que** o momento seja memorável e festivo.
* **Critérios de Aceite:**
  1. Efeito visual exuberante de fogos e confetes coloridos (`canvas-confetti`). [ENTREGUE]
  2. Efeito sonoro de vitória (fanfarra). [ENTREGUE]
  3. Botão "Jogar Novamente". [ENTREGUE]

---

## EPIC 3: ÁUDIO, AMBIENTAÇÃO E ACESSIBILIDADE
**Objetivo:** Criar atmosfera imersiva, relaxante e adequada para o ambiente festivo com controle absoluto.

### FEATURE 3.1: Paisagem Sonora e Trilha Musical
* **Prioridade:** Alta
* **Dependências:** Nenhuma

#### US-3.1.1: Trilha Sonora Suave com Mute [CONCLUÍDO ✓]
* **Como** usuário ou responsável na festa,
* **Quero** uma música de fundo suave e mágica que toque em loop, com um botão visível no canto da tela para ligar/desligar a qualquer momento,
* **Para que** eu possa dosar o som de acordo com o barulho do ambiente.
* **Critérios de Aceite:**
  1. Trilha sonora suave e instrumental em loop contínuo. [ENTREGUE - Web Audio API]
  2. Botão de alternância (Ícone de Som Ligado / Som Desligado) presente em todas as telas. [ENTREGUE]
  3. Desbloqueio transparente de áudio no primeiro clique do usuário. [ENTREGUE]

---

## EPIC 4: PWA, OFFLINE E INFRAESTRUTURA
**Objetivo:** Garantir a confiabilidade máxima da aplicação no dia da festa e facilidade de deploy.

### FEATURE 4.1: Operação 100% Offline via PWA
* **Prioridade:** Crítica
* **Dependências:** Build da aplicação

#### US-4.1.1: Instalação e Cache Completo [CONCLUÍDO ✓]
* **Como** organizador da festa,
* **Quero** abrir o link no celular/tablet ou adicioná-lo à tela de início (PWA),
* **Para que** o jogo funcione com perfeição mesmo sem internet no local do evento.
* **Critérios de Aceite:**
  1. Manifesto PWA configurado (nome, ícones, tema, orientação landscape). [ENTREGUE]
  2. Service Worker interceptando todas as rotas e assets com estratégia Cache-First. [ENTREGUE]
  3. Funcionamento idêntico no Modo Avião (offline). [ENTREGUE]

#### US-4.1.2: Persistência Local da Partida [CONCLUÍDO ✓]
* **Como** jogador,
* **Quero** que se a tela fechar ou for recarregada sem querer, o jogo lembre a posição de todos,
* **Para que** a partida não seja perdida.
* **Critérios de Aceite:**
  1. Salvamento do estado no `localStorage` ao término de cada jogada. [ENTREGUE]
  2. Opção de recuperar a partida ao reabrir ("Continuar Jogo Salvo"). [ENTREGUE]

#### US-4.1.3: Screen Wake Lock (Prevenção de Apagamento de Tela) [CONCLUÍDO ✓]
* **Como** criança ou responsável jogando,
* **Quero** que a tela do celular ou tablet não apague por inatividade durante a partida,
* **Para que** a diversão não seja interrompida enquanto as crianças decidem a jogada.
* **Critérios de Aceite:**
  1. Ativação da Screen Wake Lock API quando a partida estiver ativa. [ENTREGUE]
  2. Tratamento gracioso sem falhas em navegadores que não suportem a API. [ENTREGUE]
