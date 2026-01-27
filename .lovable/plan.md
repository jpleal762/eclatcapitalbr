

## Plano: Atualizar Ícones PWA com Logo Eclat

### Objetivo

Substituir os ícones genéricos do PWA pelo primeiro quadrado amarelo do logo Eclat (o símbolo com o "É" estilizado), para que quando o assessor baixar o app, apareça a logo oficial na home screen.

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `public/icons/icon-192x192.png` | **SUBSTITUIR** - Ícone do logo Eclat 192x192 |
| `public/icons/icon-512x512.png` | **SUBSTITUIR** - Ícone do logo Eclat 512x512 |
| `public/icons/eclat-icon.svg` | **CRIAR** - SVG do ícone isolado para referência |

---

### Detalhes Técnicos

#### 1. Criar SVG Isolado do Ícone (eclat-icon.svg)

Extrair apenas o primeiro quadrado amarelo do logo original:

```svg
<svg width="1080" height="1080" viewBox="0 0 1132 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1132" height="1080" rx="127" fill="#1a1a2e"/>
  <g clip-path="url(#clip0)">
    <path d="M998.22 0C1072.12 0 1132.03 62.9611 1132.03 136.856V621.715C1127.33 611.453 1121.75 601.498 1115.31 591.854C1092.25 555.58 1059.88 527.078 1018.22 506.351C976.556 485.623 928.569 487.147 874.258 487.147C816.227 487.147 765.636 486.271 722.485 508.294C680.078 529.67 646.598 559.791 622.047 598.655C608.082 621.453 598.215 646.145 592.441 672.731H520.604L443.478 759.03H512.167C528.293 758.228 607.235 756.724 661.42 756.724C627.267 782.995 602.996 814.206 618.795 855.002C620.205 857.344 621.661 859.666 623.163 861.965C647.714 899.534 681.566 928.682 724.717 949.41C767.868 970.138 817.343 968.614 873.142 968.614C917.781 968.614 987.715 968.004 1022.68 953.754C1058.39 939.504 1074.76 925.443 1098.57 900.829C1111.76 887.253 1122.91 872.929 1132.03 857.856V949.244C1132.03 1023.14 1071.94 1080 998.048 1080H133.806C59.9104 1080 8.87971e-05 1020.09 0 946.194V133.806C8.14439e-05 59.9104 59.9104 7.54712e-05 133.806 0H998.22ZM1132.03 755V817.27H1009.07C990.302 855.041 951.326 881 906.285 881H843.714C780.359 881 729 829.641 729 766.286V755H1132.03ZM909 569C969.199 569 1018 617.801 1018 678H726C726 617.801 774.801 569 835 569H909ZM1020.25 302.883C1020.25 302.883 940.7 327.821 886.149 336.849C831.599 345.876 740.877 349.114 740.877 349.114V421.764H1020.25V302.883Z" fill="#FFBF00"/>
  </g>
  <defs>
    <clipPath id="clip0">
      <rect width="1132.08" height="1080" rx="126.612" fill="white"/>
    </clipPath>
  </defs>
</svg>
```

---

#### 2. Gerar Ícones PNG a partir do SVG

| Tamanho | Uso |
|---------|-----|
| 192x192 | Ícone padrão Android/Chrome |
| 512x512 | Ícone alta resolução + splash screen |

O ícone terá:
- Fundo escuro (`#1a1a2e`) - cor do tema do app
- Símbolo dourado/amarelo (`#FFBF00`) - o "É" estilizado
- Bordas arredondadas para visual moderno

---

### Resultado Visual Esperado

```text
┌─────────────────────────────────┐
│                                 │
│    📱 Home Screen do Celular    │
│                                 │
│    ┌───────┐   ┌───────┐       │
│    │       │   │       │       │
│    │ 🟡 É  │   │ Outros│       │
│    │       │   │       │       │
│    └───────┘   └───────┘       │
│    Eclat KPIs    App           │
│                                 │
└─────────────────────────────────┘

Ícone detalhado:
┌──────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Fundo escuro (#1a1a2e)
│  ▓            ▓  │
│  ▓   ╔════╗   ▓  │
│  ▓   ║ É  ║   ▓  │  ← Símbolo dourado (#FFBF00)
│  ▓   ║    ║   ▓  │
│  ▓   ╚════╝   ▓  │
│  ▓            ▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────────┘
```

---

### Benefícios

1. **Identidade visual** - Logo oficial Eclat aparece no celular
2. **Reconhecimento** - Assessores identificam o app facilmente
3. **Profissionalismo** - App com visual de produto oficial
4. **Consistência** - Mesmo símbolo usado no dashboard

