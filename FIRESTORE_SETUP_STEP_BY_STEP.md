# 🔧 Passo a passo atualizado: Supabase

Este projeto agora usa Supabase em vez de Firebase Firestore. As instruções de configuração atuais estão em `README.md`.

## O que mudou

- Backend: Supabase PostgreSQL + Realtime
- Tabela usada: `inventory`
- Variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## O que fazer

1. Abra `README.md`
2. Siga os passos em **Supabase setup**
3. Não use as etapas do Firestore para o app atual

> Caso queira referenciar o histórico antigo, este arquivo mantém a informação somente como referência.

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
