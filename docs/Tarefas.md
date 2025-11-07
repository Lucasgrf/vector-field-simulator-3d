# Tarefas – Simulador Interativo 3D de Campos Vetoriais

Este documento lista as tarefas necessárias para entregar o simulador completo descrito em `docs/relatorio_calculo2.pdf`, cobrindo frontend (Three.js), backend (Node.js + mathjs), funcionalidades matemáticas (campo, divergente, rotacional, linhas de fluxo, integrais de linha), UX, performance, testes e documentação.

---

## Escopo e Entregáveis

- Aplicação web com visualização 3D de campos vetoriais (setas/instâncias + cores por magnitude/medidas).
- Backend com APIs para avaliar campo, divergente, rotacional, linhas de fluxo e integrais de linha.
- Interface para definir funções (P, Q, R), faixa de domínio, densidade de amostragem e parâmetros de simulação.
- Visualização de linhas de fluxo (partículas/linhas) e curvas paramétricas para integrais de linha.
- Exportação (imagem, presets), documentação e exemplos validados.

---

## Roadmap por Fases

- Fase 0 – Setup básico: repos, scripts, cena 3D mínima, rotas iniciais (Concluída)
- Fase 1 – Parser/segurança de expressões e avaliação do campo (ponto e grade).
- Fase 2 – Divergente e Rotacional (simbólico e/ou numérico) + endpoints.
- Fase 3 – Amostragem em grade e renderização vetorial performática (InstancedMesh).
- Fase 4 – Linhas de fluxo (integração ODE com RK4) + visualização de partículas/linhas.
- Fase 5 – Integrais de linha em curvas paramétricas + UI/plot da curva.
- Fase 6 – UX: painel de controle, presets, estados, erros; performance (Web Worker).
- Fase 7 – Persistência/exportação, testes, validação numérica e documentação final.

---

## Tarefas Detalhadas

### Backend Matemático (Node.js + mathjs)

- [x] Expressões do usuário
  - [x] Validar entrada de `(P(x,y,z), Q(x,y,z), R(x,y,z))` (somente x,y,z e funções/operadores permitidos).
  - [x] Parsear/compilar com `mathjs` (AST), rejeitar símbolos proibidos.
  - [x] Mensagens de erro claras (posição/descrição) e exemplos válidos.

- [ ] Avaliação do campo
  - [x] Endpoint `POST /api/vector-field/evaluate` (ponto único: `[x,y,z]`).
  - [x] Endpoint `POST /api/vector-field/evaluate-grid` (lote: grade de pontos no domínio ou lista de pontos).
  - [x] Cache de AST/compilados por expressão para performance.

- [ ] Infra de setup
  - [x] Endpoint `GET /api/health` para verificação inicial de ambiente.

- [ ] Derivadas, Divergente e Rotacional
  - [x] Implementar via `mathjs.derivative` (simbólico) quando possível.
  - [x] Implementar fallback numérico (diferenças finitas) com passo `h` configurável.
  - [x] Endpoints: `POST /api/vector-field/div` e `POST /api/vector-field/curl` (ponto e/ou grid).

- [x] Linhas de fluxo (streamlines)
  - [x] Integrador ODE RK4 para `dr/dt = F(r)` com passo e limites de iteração.
  - [x] Parâmetros: seeds, passo, maxSteps, bounding box, tolerância de velocidade mínima.
  - [x] Endpoint `POST /api/streamlines` retornando polilinhas por seed.

- [ ] Integrais de linha
  - [ ] Entrada: curva paramétrica `r(t)`, intervalo `[a,b]`, campo `F`.
  - [ ] Cálculo de `∫ F(r(t)) · r'(t) dt` (Simpson/trapezoidal adaptativo).
  - [ ] Endpoint `POST /api/integration/line` com presets de curvas (reta, circunferência, hélice).

- [ ] Qualidade e desempenho
  - [ ] Avaliação vetorizada em lote (arrays de pontos).
  - [ ] Timeouts e limites (tamanho de grade, passos máximos) para evitar travamentos.
  - [ ] Testes unitários: campos conhecidos (radial `F=(x,y,z)` → `div=3`; `F=(-y,x,0)` → `curl=(0,0,2)`; integral na circunferência → `2π`).

### Frontend 3D (Three.js)

- [ ] Base e organização
  - [ ] Estruturar módulos: `renderer`, `vectorFieldRenderer`, `streamlinesRenderer`, `ui`.
  - [x] Responsividade e controles de câmera (OrbitControls) já configurados.

- [x] Renderização do campo vetorial
  - [x] Amostrar grade no domínio configurável (x,y,z mín/máx e resolução) e integrar com backend.
  - [x] InstancedMesh para setas (cone instanciado) com cores por instância.
  - [x] Escalas: normalizar direção, escala de comprimento por magnitude, limiar mínimo.
  - [x] Colormap por magnitude, divergente e rotacional (|curl|) com legenda.

- [x] Linhas de fluxo
  - [x] UI para seeds (presets em grade no plano z=meio, densidade Nx×Ny).
  - [x] Renderização de polilinhas para cada streamline.
  - [x] Controles: passo (h), maxSteps, densidade de seeds.

- [ ] Integrais de linha (UI)
  - [ ] Editor/seleção de curva: presets (reta, circunferência, hélice) e entrada paramétrica.
  - [ ] Pré-visualização da curva e resultado numérico do integral.

- [ ] Painel de controle e UX
  - [x] Inputs para `P,Q,R`, domínio (min/max), resolução.
  - [x] Presets de campos (radial, rotacional, sumidouro, swirl 3D).
  - [x] Indicadores de carregamento/erro mínimos.
  - [x] Controle de escala das setas.
  - [x] Controle de raio das setas.
  - [ ] Modos de cor (div/rot) e normalização avançada.
  - [x] Debounce/throttle para recomputações (aplicar automaticamente).
  - [ ] Opção para mover cálculos pesados a Web Worker (quando aplicável).

### Integração Frontend/Backend

- [ ] Serviço de API (fetch/axios) com tratamento de erros e cancelamento.
- [x] CORS habilitado e proxy de desenvolvimento (`/api` → `http://localhost:3000`).
- [ ] Protocolos de payload consistentes (ponto único, grade, seeds, curvas).

### Persistência e Exportação

- [ ] Salvar presets de campo/domínio/parâmetros em `localStorage` (export/import JSON).
- [ ] Exportar imagem do viewport (PNG) e dados de linhas de fluxo (GeoJSON/JSON).
- [ ] Exportar resultados de integrais (JSON/CSV simples) quando aplicável.

### Qualidade, Scripts e Validação

- [x] Scripts NPM: `dev`, `build`, `start`, `lint` (opcional), `test`.
- [x] Testes unitários (backend) para helpers e derivadas; testes manuais dos endpoints.
- [x] Limites de parâmetros para evitar travas (resolução máx, seeds máx, passos máx).
- [x] Executar testes automaticamente ao iniciar o backend (`prestart`).

### Documentação

- [ ] Atualizar `README.md` (raiz) com visão geral e como executar.
- [ ] Atualizar `backend/README.md` e `frontend/README.md` com instruções e endpoints.
- [ ] Adicionar prints/gifs da visualização e exemplos (radial, rotacional, integral = 2π).
- [ ] Referências (Three.js, mathjs, Stewart, etc.).

---

## Critérios de Aceite (DoD)

- [ ] Campo vetorial: renderização em 3D com coloração por magnitude/div/rot, em uma grade configurável.
- [ ] Divergente/Rotacional: cálculo correto (validado com exemplos analíticos) no ponto e na grade.
- [ ] Linhas de fluxo: geração estável (RK4), visualização clara e controle de densidade/comprimento.
- [ ] Integrais de linha: cálculo numérico com presets e visualização da curva; exemplo da circunferência retorna ~`2π`.
- [ ] UI: entrada de funções e parâmetros com validação, presets e feedback de erro.
- [ ] Performance: interação fluida com grades médias (ex.: 17^3 setas) e múltiplas streamlines.
- [ ] Documentação: instruções de uso, prints, e resumo técnico alinhado ao relatório.

---

## Riscos e Mitigações

- Expressões inseguras: uso de AST e whitelist (sem `eval`).
- Performance em grades altas: InstancedMesh, limites e amostragem adaptativa.
- Estabilidade numérica: passos e tolerâncias configuráveis; caps e testes com campos conhecidos.
- Latência: avaliação em lote e cache de expressões; Web Worker no front.

---

## Timeline Sugerida (exemplo)

- Semana 1: Fases 1–2 (parser, avaliar campo, div/rot) + testes básicos.
- Semana 2: Fases 3–4 (render vetorial instanciado, streamlines + UI seeds).
- Semana 3: Fase 5 (integrais de linha) + UX/painel completo.
- Semana 4: Performance, persistência/export, documentação, validação final.

---

## Observações

- Alguns itens já existem no repo (cena 3D básica, rotas iniciais). Esta lista consolida a entrega final completa e pode ser usada como backlog até a versão 1.0.