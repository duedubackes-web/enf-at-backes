# ENF@BACKES — Desktop, Android e iOS (PWA v1.2)

## Implementação
- PWA com `manifest.webmanifest`, ícone SVG vetorial, `theme-color`, metadados Apple, tela offline e service worker.
- Navegação móvel por abas inferiores (Painel, Tarefas, Agentes, Biblioteca e Mais) com acesso visível a sair da conta e às demais ferramentas.
- Botão de instalação no site com prompt nativo onde permitido; instrução manual para Safari no iPhone/iPad.
- CSS com `env(safe-area-inset-bottom)` para áreas de gesto e recorte dos dispositivos.
- Nenhuma aplicação nativa publicada nas lojas Apple/Google; é a primeira versão web instalável e compartilha o mesmo código React.

## Política de offline e privacidade
O service worker armazena **somente uma página offline genérica**. Todos os recursos, documentos HTML autenticados e requisições Supabase continuam sempre na rede. Não salvar informações de pacientes, mensagens de chat, tokens, imagens ou respostas clínicas em Cache Storage/IndexedDB.
Sem internet, mostra a tela estática de reconexão, sem renderizar prontuários antigos.

**Nota:** Supabase Auth pode persistir sessão segundo suas configurações próprias. A política de service worker não substitui uma revisão completa de armazenamento, sessão, logout e dispositivos compartilhados.

## Instalação
- PC (Chrome/Edge): menu do navegador → Instalar aplicativo, quando disponível.
- Android (Chrome): aviso Instalar/Adicionar à tela inicial ou menu do navegador.
- iPhone (Safari): Compartilhar → Adicionar à Tela de Início → Abrir como App.
- A instalação, suporte a ícones e comportamento de prompt podem variar entre navegadores e versões do sistema.

## Próximos passos para Codex
1. Validar ícones PNG 192x192 e 512x512 e apple-touch-icon 180x180 de marca própria em Chrome Android e Safari iOS.
2. Testes reais com Safari iOS, Chrome Android, tablets e desktop usando contas e dados fictícios.
3. Testes automatizados de manifest, service worker e navegação para evitar regressões.
4. Avaliar empacotamento nativo com Capacitor **somente após** validação de autenticação, LGPD, notificações e requisitos de lojas.
5. Testes de autenticação, atualização de PWA e isolamento RLS por unidade antes de uso com informações de pacientes.

## URLs
GitHub: https://github.com/duedubackes-web/enf-at-backes
Vercel (projeto existente): ebb10/enf-at-backes
