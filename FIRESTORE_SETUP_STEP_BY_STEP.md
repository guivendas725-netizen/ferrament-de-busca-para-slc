# 🔧 Passo a Passo: Configurar Firestore para Sincronização

## PASSO 1️⃣: Abra Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Clique no seu projeto: **"buscaq-slc-planorte"**
3. Na esquerda, clique em **"Firestore Database"**

```
Você deve ver algo como:
┌─────────────────────────────┐
│ Firebase Console            │
│ ├─ Visão Geral             │
│ ├─ Authentication          │
│ ├─ Firestore Database  ← CLIQUE AQUI
│ ├─ Realtime Database       │
│ ├─ Storage                 │
│ └─ ...                      │
└─────────────────────────────┘
```

---

## PASSO 2️⃣: Criar Coleção "inventory" (se não existir)

### 2a. Verifique se já existe

Abra Firestore Database. Se você vê **"Nenhuma coleção"**, passe para 2b.

Se já vê uma coleção chamada **"inventory"**, vá direto para o **PASSO 3** ✅

### 2b. Criar coleção (se vazia)

1. Clique em **"Iniciar coleção"** (ou "+ Adicionar coleção")
2. Nome da coleção: `inventory`
3. Clique em **"Próximo"**
4. Em "ID do documento", escreva: `RLM-001`
5. Adicione os campos:

```
code        (String)  = RLM-001
name        (String)  = Rolamento SKF 6205
sector      (String)  = Almoxarifado
location    (String)  = Prat. A3 · Gaveta 28
status      (String)  = Disponível
quantity    (String)  = 1 UN
```

6. Clique em **"Salvar"**

✅ Coleção "inventory" criada!

---

## PASSO 3️⃣: Configurar Regras de Segurança ⭐ (IMPORTANTE!)

### 3a. Clique na aba "Regras"

```
Você deve estar em:
Firestore Database
├─ Dados (aba)
└─ Regras (aba) ← CLIQUE AQUI
```

### 3b. Apague o conteúdo atual

Você verá algo como:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Selecione TUDO** (Ctrl+A) e **delete**.

### 3c. Cole este código exatamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 3d. Clique em "Publicar"

```
Botão azul no canto inferior direito:
┌─────────────────┐
│   Publicar   ← CLIQUE
└─────────────────┘
```

✅ Regras salvas!

---

## PASSO 4️⃣: Verificar se Funcionou

### 4a. Abra o app em um navegador

```
http://localhost:5173/
```

### 4b. Abra o DevTools (F12)

1. Pressione **F12** no teclado
2. Clique em **"Console"**
3. Procure por mensagens de erro

Se vir algo como:
```
Firestore snapshot failed: ...
```

❌ Algo está errado (volte para o Passo 3)

Se não vir erros, continue...

### 4c. Teste a sincronização

1. Abra **2 abas do navegador** com o app:
   - Aba 1: `http://localhost:5173/`
   - Aba 2: `http://localhost:5173/`

2. **Na Aba 1**, procure uma peça e clique em **"Marcar como retirada"**

3. **Na Aba 2**, veja se a peça mudou para **"Acabou"** em menos de 1 segundo

✅ Se apareceu, funcionou! 🎉

---

## PASSO 5️⃣: Testar em Celular/Outro Computador

### 5a. Descubra o IP do seu computador

Abra **PowerShell** e escreva:

```powershell
ipconfig
```

Procure por uma linha que começa com `IPv4 Address:` algo como:
```
IPv4 Address:  192.168.1.100
```

Copie esse número.

### 5b. No celular/outro computador, acesse:

```
http://192.168.1.100:5173/
```

(Substitua `192.168.1.100` pelo IP que você copiou)

### 5c. Faça uma ação no celular

Marque uma peça como "Acabou" no celular, veja se aparece no computador em < 1 segundo.

✅ Sincronização funcionando em tempo real! 🚀

---

## PASSO 6️⃣: Verificar Dados no Firestore Console

Depois de usar o app:

1. Firebase Console → Firestore Database → Aba "Dados"
2. Clique em "inventory"
3. Veja todos os documentos (peças) que foram adicionadas
4. Clique em um documento para ver os detalhes

```
Você deve ver algo como:

inventory
├─ RLM-001
│  ├─ code: "RLM-001"
│  ├─ name: "Rolamento SKF 6205"
│  ├─ sector: "Almoxarifado"
│  ├─ location: "Prat. A3 · Gaveta 28"
│  ├─ status: "Disponível"
│  └─ quantity: "1 UN"
│
├─ MGR-014
│  └─ ...
│
└─ FTR-220
   └─ ...
```

---

## 🆘 Se Algo Não Funcionar

### ❌ Erro: "Permission denied"

**Solução**: Volte para **Passo 3** e verifique se colou as regras corretamente.

As regras devem ser EXATAMENTE assim:
```javascript
allow read: if true;
allow write: if true;
```

### ❌ App abre mas não mostra peças

**Solução**: 
1. Verifique se a coleção "inventory" existe (Passo 2)
2. F12 → Console → procure por "Firestore error"
3. Verifique se `.env` tem as credenciais corretas

### ❌ Sincronização lenta (> 5 segundos)

**Solução**:
- Verifique conexão com internet
- Feche outras abas do navegador
- Reinicie o app

---

## ✅ Checklist Final

```
☐ Acessei Firebase Console
☐ Criei/verifiquei coleção "inventory"
☐ Configurei Firestore Rules
☐ Testei em 2 abas - funcionou < 1s
☐ Testei em celular/outro computador
☐ Vejo dados no Firestore Console
☐ Sem erros no Console (F12)

Tudo feito? Parabéns! 🎉
```

---

## 📞 Dúvidas Comuns

**P: Preciso adicionar dados no Firestore manualmente?**  
R: Não! O app faz isso automaticamente quando você clica "Adicionar peça"

**P: Quem mais pode acessar os dados?**  
R: Qualquer pessoa com o link pode ler/escrever (porque as regras permitem `if true`). Para produção, adicione autenticação.

**P: E se ficar sem internet?**  
R: O app funciona offline! As ações são guardadas localmente e sincronizam quando reconectar.

**P: Posso deletar a coleção "inventory"?**  
R: Sim, mas vai perder todos os dados. O app recria quando você adicionar uma nova peça.
