

## Plano: Atualizar Ícone do PWA com Nova Logo Amarela

### Objetivo

Substituir o ícone atual do app (fundo escuro com símbolo dourado) pela nova logo enviada: fundo amarelo/dourado com o "é" estilizado em preto. Esta será a imagem que aparece na home screen quando o assessor baixar o app.

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `public/icons/icon-192x192.png` | **SUBSTITUIR** - Nova logo 192x192 |
| `public/icons/icon-512x512.png` | **SUBSTITUIR** - Nova logo 512x512 |
| `public/icons/eclat-icon.svg` | **REMOVER** - Não será mais necessário (logo agora é imagem) |

---

### Detalhes da Implementação

#### 1. Copiar Imagem do PDF para o Projeto

A imagem extraída do PDF será copiada e redimensionada para os tamanhos necessários:
- **192x192px** - Ícone padrão Android/Chrome
- **512x512px** - Ícone alta resolução + splash screen

#### 2. Características da Nova Logo

| Aspecto | Valor |
|---------|-------|
| Fundo | Amarelo/Dourado (#FFBF00 ou similar) |
| Símbolo | "é" estilizado em preto |
| Bordas | Arredondadas (já presente na imagem) |
| Formato | Quadrado (ideal para ícones de app) |

---

### Comparação Visual

```text
ANTES (atual)                    DEPOIS (nova logo)
┌──────────────────┐            ┌──────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │            │  ████████████████  │
│  ▓  Fundo     ▓  │            │  █  Fundo      █  │
│  ▓  ESCURO    ▓  │            │  █  AMARELO    █  │
│  ▓            ▓  │            │  █             █  │
│  ▓   ╔════╗   ▓  │            │  █      ē      █  │
│  ▓   ║ É  ║   ▓  │            │  █    (preto)  █  │
│  ▓   ║    ║   ▓  │            │  █             █  │
│  ▓  dourado   ▓  │            │  █             █  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │            │  ████████████████  │
└──────────────────┘            └──────────────────┘
   #1a1a2e + #FFBF00               #FFBF00 + #000000
```

---

### Resultado Esperado

Quando o assessor baixar o app no celular, o ícone na home screen será:
- **Fundo amarelo vibrante** - Alta visibilidade
- **Símbolo "é" preto** - Contraste forte, fácil reconhecimento
- **Visual moderno** - Bordas arredondadas já integradas

---

### Benefícios

1. **Identidade visual atualizada** - Usa a logo oficial mais recente
2. **Alta visibilidade** - Fundo amarelo se destaca na home screen
3. **Contraste forte** - Preto no amarelo é muito legível
4. **Consistência** - Mesma logo usada em outros materiais da Eclat

