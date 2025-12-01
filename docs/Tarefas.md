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