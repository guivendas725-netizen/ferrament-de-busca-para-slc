# 🔄 Configuração Firestore para Sincronização em Tempo Real

## 1. Estrutura da Coleção ("inventory")

### Documento Requerido
```
Collection: "inventory"
├── Document ID: [código da peça, ex: "RLM-001"]
│   ├── code: "RLM-001"              [String] - Identificador único
│   ├── name: "Rolamento SKF 6205"   [String] - Nome da peça
│   ├── sector: "Almoxarifado"       [String] - Setor (apenas 2 valores permitidos)
│   ├── location: "Prat. A3 · Gaveta 28" [String] - Localização física
│   ├── status: "Disponível"         [String] - Estado atual
│   ├── quantity: "1 UN"             [String] - Quantidade
│   └── timestamp: [TIMESTAMP]       [Recomendado] - Data/hora da última atualização
```

### Valores Aceitos para "status"
- `"Disponível"` - Peça pronta para ser retirada
- `"Acabou"` - Peça foi retirada/acabou

### Valores Aceitos para "sector"
- `"Almoxarifado"` - Apenas este setor
- `"Sala do Morto"` - Apenas este setor
- ⚠️ Outros setores são **ignorados** pela aplicação

---

## 2. Regras de Segurança (Firestore Security Rules)

### Configuração Recomendada
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{document=**} {
      // Permitir leitura pública (sem autenticação)
      allow read: if true;
      
      // Apenas escrita sem autenticação por enquanto
      // Para produção, adicione autenticação com Firebase Auth
      allow write: if true;
    }
  }
}
```

### Para Produção com Autenticação
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 3. Configuração Necessária no Firestore Console

### ✅ Habilitar Firestore Database
1. Firebase Console → Seu Projeto
2. **Firestore Database** → Criar banco de dados
3. Modo: **Iniciar no modo de teste** (ou produção com as rules acima)
4. Região: Qualquer uma (recomendado mais próxima dos usuários)

### ✅ Criar Coleção "inventory"
1. Firestore Console → **Criar Coleção**
2. ID: `inventory`
3. Adicionar primeiro documento (opcional - a app fará isso)

### ✅ Ativar Offline Persistence (IMPORTANTE!)
Adicionar no App.jsx:
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore'

if (hasFirebaseConfig) {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Múltiplas abas abertas - offline sync pode não funcionar')
      } else if (err.code === 'unimplemented') {
        console.warn('Navegador não suporta offline persistence')
      }
    })
}
```

---

## 4. Como Funciona a Sincronização em Tempo Real

### 📡 Fluxo de Dados

```
Dispositivo A (Celular/Computador)
  ↓
  [Ação: Marcar como "Acabou"]
  ↓
  Firebase Firestore (Nuvem)
  ↓↓↓ Broadcasting em tempo real ↓↓↓
  ↓
Dispositivo B (Outro celular/Computador)
  ↓
  [onSnapshot recebe a atualização]
  ↓
  [UI atualiza automaticamente]
```

### 🔧 Tecnologia Usada no App

```javascript
// Listener real-time (atualiza automaticamente)
const unsubscribe = onSnapshot(
  query(collection(db, 'inventory'), orderBy('code')),
  (snapshot) => {
    // Chamado TODA VEZ que há mudança no Firestore
    setItems(snapshot.docs.map(doc => ({...doc.data()})))
  }
)
```

---

## 5. Requisitos de Rede para Sincronização

### Necessário
- ✅ Conexão com internet ativa (WiFi ou dados móveis)
- ✅ Acesso a `*.firebaseio.com` (portas 443 e 80)
- ✅ WebSocket habilitado no navegador

### Funcionalidades Offline
- ✅ Ler dados (cache local)
- ✅ Fazer ações (fila de sincronização)
- ❌ Receber updates em tempo real (sem internet)

---

## 6. Variáveis de Ambiente Requeridas

### `.env` (NUNCA commitar para Git)
```
VITE_FIREBASE_API_KEY=seu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

---

## 7. Verificação de Funcionamento

### ✅ Testar Sincronização em Tempo Real

1. **Abra o app em 2 navegadores diferentes** (ou 2 dispositivos)
   ```
   http://localhost:5173/  (Navegador 1)
   http://localhost:5173/  (Navegador 2)
   ```

2. **No Navegador 1**, marque uma peça como "Acabou"

3. **Verificar no Navegador 2**: Deve atualizar em < 1 segundo

### ✅ Verificar Firestore Console

1. Firebase Console → Firestore Database
2. Collection: `inventory`
3. Veja o documento atualizado em tempo real

### ✅ Verificar Modo Offline

1. Abra DevTools (F12)
2. Network → **Offline**
3. Realize ações (devem funcionar localmente)
4. Network → **Online** novamente
5. Mudanças devem sincronizar automaticamente

---

## 8. Ações que Sincronizam em Tempo Real

| Ação | Campo Alterado | Tempo de Sincronização |
|------|---|---|
| Marcar como Retirada | `status: "Acabou"` | < 1s |
| Marcar como Disponível | `status: "Disponível"` | < 1s |
| Apagar Peça | Documento deletado | < 1s |
| Adicionar Peça | Novo documento criado | < 1s |

---

## 9. Solução de Problemas

### ❌ Dados não sincronizam entre dispositivos

**Causas possíveis:**
1. ❌ Sem conexão com internet
2. ❌ `.env` não configurado corretamente
3. ❌ Firestore Rules bloqueando acesso
4. ❌ Firestore Database não criado

**Solução:**
- Verificar Console do Navegador (F12 → Console)
- Procurar por "Firestore error"
- Ir para Firebase Console → Logs

### ❌ Ações lentas (> 2 segundos)

**Causas possíveis:**
1. 📡 Conexão de internet lenta
2. 🔥 Muitos documentos na coleção (criar índices no Firestore)
3. ⚠️ Firestore regras de segurança muito complexas

**Solução:**
- Criar índice composto no Firestore Console
- Query: `collection: inventory, orderBy: code`

---

## 10. Próximas Melhorias (Opcional)

- [ ] Adicionar autenticação com Google/email
- [ ] Histórico de modificações (quem fez, quando)
- [ ] Backup automático
- [ ] Notificações push em tempo real
- [ ] Sincronização offline mais robusta
