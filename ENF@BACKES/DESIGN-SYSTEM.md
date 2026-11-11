# ENF@BACKES | Design system v0.5

Paleta: azul clínico profundo #062c3b; ciano #03c7db; verde água #33e4bf; fundo branco #ffffff; texto #082d3e.

A entrada pública usa o componente `src/Landing.tsx` e `src/landing.css`. A área profissional já existente permanece protegida pelo Supabase Auth e RLS, sem mudar as políticas do banco.

A prévia do painel na landing usa somente **dados fictícios**, rotulados explicitamente como demonstração. Animações utilizam CSS e IntersectionObserver, respeitando `prefers-reduced-motion`.

Checklist: navegação responsiva; menu mobile; modal de login institucional; foco visível; título do dialog; link de salto; tamanhos móveis; cabeçalhos semânticos; evitar claims de validação ou resultados clínicos não comprovados.

Roadmap futuro: testes de acessibilidade com leitores de tela; aprisionamento de foco no diálogo; auditoria de acessibilidade WCAG 2.2 AA; análises de desempenho e testes cross-browser.
