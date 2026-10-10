# AskMe Geo

Quiz de Geografia no estilo roleta (inspirado em Perguntados), tema claro, com área de estudo.

## Modos

- **Jogar**: gire a roleta (8 fatias, Capitais ocupa 2), responda em 20 s, 3 vidas. Três acertos enchem o medidor e liberam a pergunta da coroa (pontos em dobro). Vence quem juntar as 6 coroas.
- **Treinar**: escolha categoria, continente, escopo de capitais (países / estados do Brasil / tudo), quantidade e cronômetro. Ao final, refaça só os erros.
- **Estudar**: lista de capitais com busca sem acento e modo "esconder capitais"; flashcards com repetição espaçada (Leitner, 5 níveis); capitais dos 26 estados por região; fatos de geografia física.

## Conteúdo

| Categoria | Fonte | Perguntas |
|---|---|---|
| Capitais | 185 países + 24 estados (país→capital e capital→país) | ~390 |
| Bandeiras | 185 países, SVG local (`flag-icons`) | 185 |
| Continentes | países não transcontinentais | ~175 |
| Moedas | países com moeda definida | ~183 |
| Idiomas | países com idioma oficial de jure | ~178 |
| Natureza | fatos curados | 44 |

Distratores vêm preferencialmente do mesmo continente/região. Idiomas cooficiais regionais e moedas de curso legal adicional nunca aparecem como alternativa errada (evita gabarito contestável). Casos disputados (Israel/Palestina, Taiwan, Kosovo, Nauru, Guiné Equatorial) ficam fora.

## Stack

React 19 + TypeScript (strict) + Vite. Sem backend: progresso em `localStorage`. Roteamento por hash (funciona em hospedagem estática).

```bash
npm install
npm run dev        # desenvolvimento
npm test           # integridade da base, gerador de perguntas, regras do modo clássico
npm run build      # typecheck + build estático em dist/
```

## Estrutura

```
src/
  data/       países, estados, continentes, fatos
  game/       tipos, gerador de perguntas, reducer do modo clássico, RNG, gramática (do/da/de)
  storage/    progresso (useSyncExternalStore + localStorage)
  components/ roleta, pergunta, HUD, resultados, bandeira, ícones
  screens/    Home, ClassicGame, Practice, Study
```
