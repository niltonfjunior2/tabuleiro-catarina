# Cat no Reino dos Unicórnios

Aplicação Web Progressiva (PWA) interativa, mobile-first e 100% offline-first. Reproduz digitalmente o jogo de tabuleiro de unicórnios com até 4 participantes no mesmo dispositivo (*pass-and-play*).

---

## 🦄 Recursos Principais

* **Modo Paisagem (Landscape) & Doca Lateral:** Interface panorâmica com cabeçalho superior e dock lateral do dado, garantindo 100% de visibilidade de todas as 52 casas do tabuleiro sem sobreposições.
* **Até 4 Jogadores:** Identificados visualmente por cores (Rosa, Lilás, Amarelo e Turquesa) em pass-and-play.
* **Automação 100% Visual para Crianças:** Sem exigência de leitura de textos. Feedback visual imediato em todas as ações.
* **Casas Especiais Oficiais:** Saltos, penalidade de foto, atalho, minigame da sorte na casa 13 e corrida até a chegada.
* **Regra da Chegada Exata:** Ricochete (bate-e-volta) para quem ultrapassar o valor exato da casa Chegada.
* **Celebração:** Explosão de fogos de artifício na tela ao consagrar o vencedor.
* **100% Offline (PWA):** Instalação facilitada com botão nativo para Android e iOS Safari, com operação completa sem internet.
* **Screen Wake Lock:** Mantém a tela ligada sem apagar por inatividade durante a partida.
* **Trilha Sonora Relaxante:** Fundo musical suave em loop com controle de ativação/mudo.

---

## 📁 Estrutura de Diretórios

```
tabuleiro-catarina/
├── .ai/                    # Artefatos arquiteturais (PROJECT_DNA, BACKLOG, PLAN, GUIDE)
├── public/                 # Assets estáticos servidos diretamente e precacheados
│   └── assets/             # Imagens otimizadas e áudios
├── src/
│   ├── core/               # Domínio Puro (Regras, FSM, Tipos - 100% agnóstico de UI)
│   │   ├── __tests__/      # Testes unitários do motor de regras (Vitest)
│   │   ├── types.ts        # Contratos de tipos do domínio
│   │   └── index.ts        # Lógica pura de movimentação e cálculo
│   ├── data/               # Configurações JSON imutáveis (coordenadas e regras especiais)
│   ├── components/         # Camada de Apresentação React (UI e animações)
│   ├── services/           # Adaptadores de áudio, persistência local e wake lock
│   ├── dev/                # Ferramentas internas de calibração para desenvolvimento
│   ├── App.tsx             # Componente raiz da aplicação
│   ├── main.tsx            # Entrypoint React
│   └── index.css           # Estilos globais e TailwindCSS
├── index.html              # Entrypoint HTML com meta tags PWA
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração de TypeScript estrito
├── vite.config.ts          # Configuração de build e plugin PWA
└── vitest.config.ts        # Configuração da esteira de testes automatizados
```

---

## 🛠️ Comandos de Desenvolvimento

### Instalar Dependências
```bash
npm install
```

### Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

### Rodar Testes Automatizados (Vitest)
```bash
npm run test
```

### Verificação de Tipagem Estrita
```bash
npm run typecheck
```

### Gerar Build de Produção
```bash
npm run build
```

---

## 📜 Governança Arquitetural
Para entender as regras arquiteturais, consulte os documentos na pasta `.ai/`:
* [PROJECT_DNA.md](file:///.ai/PROJECT_DNA.md)
* [PRODUCT_BACKLOG.md](file:///.ai/PRODUCT_BACKLOG.md)
* [IMPLEMENTATION_PLAN.md](file:///.ai/IMPLEMENTATION_PLAN.md)
* [AI_EXECUTION_GUIDE.md](file:///.ai/AI_EXECUTION_GUIDE.md)
