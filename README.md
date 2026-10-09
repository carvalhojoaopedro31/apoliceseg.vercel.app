# apoliceseg.vercel.app

Site estático da Apólice Seg (HTML, CSS e JS, sem build). A Vercel publica direto do branch `main`.

## Arquivos
- `index.html` e `sobre.html`: as duas páginas.
- `styles.css`: todo o estilo (tokens de design no topo).
- `site.js`: configurações (WhatsApp, GA4, Pixel, SUSEP, CNPJ) e comportamentos. **Edite a seção CONFIG no topo.**
- `fonts/`: fonte Inter hospedada aqui (licença OFL em `fonts/OFL-Inter.txt`).
- `img/` e `*.webp`: fotos. Cada foto tem o `.jpg` original e versões `.webp` menores (`-640`, `-1200`, etc.).
- `robots.txt`, `sitemap.xml`, `404.html`, `vercel.json`: infraestrutura.

## Lembretes de pendências
Abra o site com `?lembretes=1` no final do endereço (ex.: `apoliceseg.vercel.app/?lembretes=1`).
Aparecem avisos laranjas onde falta algo (logos das seguradoras, fotos da equipe, números a confirmar, SUSEP, GA4, Pixel).
O público não vê nada disso.

## Comparador "sem seguro / com seguro" (página Sobre)
Cada história pode virar comparador quando existir a foto par. Passos:
1. Gere a foto par no mesmo enquadramento e salve em `img/sobre/` com o nome previsto
   (`automovel-batida-depois.jpg`, `automovel-roubo-depois.jpg`, `alagamento-depois.jpg`, `saude-depois.jpg`,
   `residencial-depois.jpg`, `empresarial-depois.jpg` e, para vida, `vida-antes.jpg`).
2. Acrescente o nome (`'batida'`, `'roubo'`, `'alagamento'`, `'saude'`, `'residencial'`, `'empresarial'`, `'vida'`) em `CONFIG.pares`, no `site.js`.
Enquanto o nome não estiver em `CONFIG.pares`, a história mostra só a foto atual.

## Ao trocar uma foto, mude o nome do arquivo
O navegador guarda as fotos de `img/` por 24 horas. Se uma foto for trocada mantendo o mesmo nome, quem já visitou o site continua vendo a antiga.
Por isso, ao trocar uma foto, dê um nome novo (ex.: `saude-v3.jpg`) e atualize o `sobre.html`. As fotos atuais da página Sobre terminam em `-v2`.

## Antes de mexer em algo grande
O branch `estado-seguro-07out` guarda a última versão aprovada antes do refino de produto. Para voltar, crie um PR dele para o `main`.

## Pendências
A lista do que falta passar (SUSEP, horário, política de privacidade, confirmações de texto, fotos) está em `PENDENCIAS.md`.
