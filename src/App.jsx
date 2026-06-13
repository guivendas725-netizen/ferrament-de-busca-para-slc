import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'
import logo from "./assets/logoBuscAq.png"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

const allowedSectors = ['Almoxarifado', 'Sala do Morto']

const initialInventory = [
  {
    code: 'RLM-001',
    name: 'Rolamento SKF 6205',
    sector: 'Oficina Mecânica',
    location: 'Prat. A3 · Gaveta 28',
    status: 'Disponível',
    quantity: '1 UN',
  },
  {
    code: 'MGR-014',
    name: 'Mangueira hidráulica 1/2"',
    sector: 'Sala do Morto',
    location: 'Prat. B1 · Suporte parede',
    status: 'Disponível',
    quantity: '3 PC',
  },
  {
    code: 'FTR-220',
    name: 'Filtro de óleo trator MF',
    sector: 'Almoxarifado',
    location: 'Prat. C2 · Caixa 412',
    status: 'Disponível',
    quantity: '12 UN',
  },
  {
    code: 'FRR-007',
    name: 'Chave de fenda Phillips',
    sector: 'Oficina Mecânica',
    location: 'Prat. A1 · Painel ferramentas',
    status: 'Acabou',
    quantity: '0 UN',
  },
  {
    code: 'ENG-002',
    name: 'Engrenagem catraca 40 dentes',
    sector: 'Sala do Morto',
    location: 'Prat. B2 · Gaveta 02',
    status: 'Disponível',
    quantity: '7 PC',
  },
  {
    code: 'PAR-108',
    name: 'Parafuso sextavado M10',
    sector: 'Fazenda Geral',
    location: 'Prat. D4 · Bandeja 16',
    status: 'Disponível',
    quantity: '50 UN',
  },
  {
    code: 'KIT-010',
    name: 'Kit jateamento de piso',
    sector: 'Setor Agrícola',
    location: 'Prat. F3 · Caixa 05',
    status: 'Acabou',
    quantity: '0 KIT',
  },
]

function App() {
  const [items, setItems] = useState(hasSupabaseConfig ? [] : initialInventory)
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('Todos os setores')
  const [statusFilter, setStatusFilter] = useState('Todos os status')
  const [newPiece, setNewPiece] = useState({
    code: '',
    name: '',
    sector: '',
    location: '',
    status: 'Disponível',
    quantity: '',
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(hasSupabaseConfig)

  useEffect(() => {
    if (!hasSupabaseConfig) {
      return
    }

    async function loadInventory() {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('code', { ascending: true })

      if (error) {
        console.error('Supabase select error:', error)
        setLoading(false)
        return
      }

      setItems(data ?? [])
      setLoading(false)
    }

    function applyRealtimeChange(payload) {
      const newRecord = payload.new ?? payload.record
      const oldRecord = payload.old ?? payload.old_record

      if (payload.eventType === 'DELETE') {
        const codeToRemove = oldRecord?.code ?? newRecord?.code
        if (!codeToRemove) {
          loadInventory()
          return
        }

        setItems((current) => current.filter((item) => item.code !== codeToRemove))
        return
      }

      if (newRecord?.code) {
        setItems((current) =>
          current.some((item) => item.code === newRecord.code)
            ? current.map((item) =>
                item.code === newRecord.code ? newRecord : item,
              )
            : [newRecord, ...current],
        )
        return
      }

      loadInventory()
    }

    loadInventory()

    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          applyRealtimeChange(payload)
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const sectors = useMemo(
    () => ['Todos os setores', ...allowedSectors],
    [],
  )
  const statuses = useMemo(
    () => ['Todos os status', ...new Set(items.map((item) => item.status))],
    [items],
  )

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return items
      .filter((item) => allowedSectors.includes(item.sector))
      .filter((item) => {
        const matchesSearch =
          item.code.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query)

        const matchesSector =
          sectorFilter === 'Todos os setores' || item.sector === sectorFilter
        const matchesStatus =
          statusFilter === 'Todos os status' || item.status === statusFilter

        return matchesSearch && matchesSector && matchesStatus
      })
  }, [items, search, sectorFilter, statusFilter])

  function handleNewPieceChange(key, value) {
    setNewPiece((current) => ({ ...current, [key]: value }))
  }

  async function handleAddPiece(event) {
    event.preventDefault()
    const trimmedData = {
      ...newPiece,
      code: newPiece.code.trim(),
      name: newPiece.name.trim(),
      sector: newPiece.sector.trim(),
      location: newPiece.location.trim(),
      quantity: newPiece.quantity.trim(),
    }

    if (
      !trimmedData.code ||
      !trimmedData.name ||
      !trimmedData.sector ||
      !trimmedData.location ||
      !trimmedData.quantity
    ) {
      window.alert('Preencha todos os campos para adicionar uma peça.')
      return
    }

    if (hasSupabaseConfig) {
      const { error } = await supabase
        .from('inventory')
        .upsert(trimmedData, { onConflict: 'code' })

      if (error) {
        console.error('Supabase upsert error:', error)
      }
    } else {
      setItems((current) => [trimmedData, ...current])
    }

    setNewPiece({
      code: '',
      name: '',
      sector: '',
      location: '',
      status: 'Disponível',
      quantity: '',
    })
  }

  async function handleTakePiece(code) {
    const item = items.find((item) => item.code === code)
    if (!item) {
      return
    }

    const updated = { ...item, status: 'Acabou' }

    if (hasSupabaseConfig) {
      const { error } = await supabase
        .from('inventory')
        .update({ status: 'Acabou' })
        .eq('code', code)

      if (error) {
        console.error('Supabase update error:', error)
      }
    } else {
      setItems((current) =>
        current.map((item) =>
          item.code === code ? updated : item,
        ),
      )
    }
  }

  async function handleMakeAvailable(code) {
    const item = items.find((item) => item.code === code)
    if (!item) {
      return
    }

    const updated = { ...item, status: 'Disponível' }

    if (hasSupabaseConfig) {
      const { error } = await supabase
        .from('inventory')
        .update({ status: 'Disponível' })
        .eq('code', code)

      if (error) {
        console.error('Supabase update error:', error)
      }
    } else {
      setItems((current) =>
        current.map((item) =>
          item.code === code ? updated : item,
        ),
      )
    }
  }

  async function handleDeletePiece(code) {
    if (hasSupabaseConfig) {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('code', code)

      if (error) {
        console.error('Supabase delete error:', error)
      } else {
        setItems((current) => current.filter((item) => item.code !== code))
      }
    } else {
      setItems((current) => current.filter((item) => item.code !== code))
    }
  }

  return (
    <div className="app-shell">
      <img src={logo} id="logo1"></img>
      <header className="hero-section">
        <div>
          <p className="subtitle">Busca de Peças</p>
          <h1 id="cb_slc_inicio">SLC - PLANORTE</h1>
          <p className="description">
            Pesquise por código, nome ou setor. Veja imediatamente onde cada peça
            está localizada e se ela está disponível.
          </p>
        </div>
        <div className="status-pill">BuscAq · Plnaorte</div>
      </header>

      <section className="search-panel">
        <div className="search-group">
          <label htmlFor="search">Pesquisar peça</label>
          <input
            id="search"
            type="search"
            placeholder="Código ou nome da peça"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-item">
            <label htmlFor="sector">Setor</label>
            <select
              id="sector"
              value={sectorFilter}
              onChange={(event) => setSectorFilter(event.target.value)}
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="add-piece-trigger">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowAddForm(true)}
        >
          + Adicionar peça
        </button>
      </section>

      {showAddForm && (
        <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
          <div className="add-piece-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Adicionar nova peça</h2>
                <p>Preencha os dados e clique em salvar.</p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form className="add-piece-form" onSubmit={handleAddPiece}>
              <div className="form-row">
                <label htmlFor="code">Código</label>
                <input
                  id="code"
                  type="text"
                  value={newPiece.code}
                  onChange={(event) => handleNewPieceChange('code', event.target.value)}
                />
              </div>

              <div className="form-row">
                <label htmlFor="name">Nome da peça</label>
                <input
                  id="name"
                  type="text"
                  value={newPiece.name}
                  onChange={(event) => handleNewPieceChange('name', event.target.value)}
                />
              </div>

              <div className="form-row">
                <label htmlFor="sectorInput">Setor</label>
                <select
                  id="sectorInput"
                  value={newPiece.sector}
                  onChange={(event) => handleNewPieceChange('sector', event.target.value)}
                >
                  <option value="">Selecione o setor</option>
                  {allowedSectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="location">Localização</label>
                <input
                  id="location"
                  type="text"
                  value={newPiece.location}
                  onChange={(event) => handleNewPieceChange('location', event.target.value)}
                />
              </div>

              <div className="form-row">
                <label htmlFor="quantity">Quantidade</label>
                <input
                  id="quantity"
                  type="text"
                  placeholder="Ex: 3 PC ou 1 UN"
                  value={newPiece.quantity}
                  onChange={(event) => handleNewPieceChange('quantity', event.target.value)}
                />
              </div>

              <div className="form-row">
                <label htmlFor="statusInput">Status</label>
                <select
                  id="statusInput"
                  value={newPiece.status}
                  onChange={(event) => handleNewPieceChange('status', event.target.value)}
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Acabou">Acabou</option>
                </select>
              </div>

              <button type="submit" className="primary-button">
                Salvar peça
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="results-section">
        <div className="results-header">
          <div>
            <p className="results-label">Resultados</p>
            <h2>{filteredItems.length} peça(s) encontrada(s)</h2>
          </div>
          <p className="results-meta">
            Filtrando por: {sectorFilter}, {statusFilter}
          </p>
        </div>

        {hasSupabaseConfig && loading ? (
          <div className="loading-state">Carregando inventário...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            Nenhuma peça encontrada. Ajuste a busca ou os filtros.
          </div>
        ) : (
          <div className="card-grid">
            {filteredItems.map((item) => {
              const statusClass = item.status
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')

              return (
                <article key={item.code} className="item-card">
                  <div className="item-header">
                    <span className="item-code">{item.code}</span>
                    <span className={`item-status ${statusClass}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="item-sector">{item.sector}</p>
                  <p className="item-location">{item.location}</p>
                  <p className="item-quantity">Quantidade: {item.quantity}</p>
                  <div className="item-actions">
                    {item.status === 'Disponível' && (
                      <button
                        type="button"
                        className="item-action-button take-button"
                        onClick={() => handleTakePiece(item.code)}
                      >
                        Marcar como retirada
                      </button>
                    )}
                    {item.status === 'Acabou' && (
                      <>
                        <button
                          type="button"
                          className="item-action-button available-button"
                          onClick={() => handleMakeAvailable(item.code)}
                        >
                          Marcar como disponível
                        </button>
                        <button
                          type="button"
                          className="item-action-button delete-button"
                          onClick={() => handleDeletePiece(item.code)}
                        >
                          Apagar peça
                        </button>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default App
