import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Upload, Trash2, UserPlus, Database, Shield, AlertCircle, Check, X, Plus, Edit2 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import SuperAdminPinModal from '../components/SuperAdminPinModal'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [activeSection, setActiveSection] = useState('data')
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinAction, setPinAction] = useState(null)

  // Employee Data Management State
  const [file, setFile] = useState(null)
  const [importResult, setImportResult] = useState(null)

  // Admin Management State
  const [admins, setAdmins] = useState([])
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: '', pin: '', confirmPin: '' })

  // Database Schema State
  const [dbSchema, setDbSchema] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [editingColumn, setEditingColumn] = useState(null)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumn, setNewColumn] = useState({ name: '', type: 'String', nullable: false })

  const sections = [
    { id: 'data', labelKey: 'gestionDonnees', icon: Upload },
    { id: 'admins', labelKey: 'gestionAdmins', icon: Shield },
    { id: 'database', labelKey: 'structureDatabase', icon: Database },
  ]

  const handlePinVerified = async () => {
    setShowPinModal(false)

    if (pinAction === 'delete-all') {
      await handleDeleteAllEmployees()
    } else if (pinAction === 'view-database') {
      await loadDatabaseSchema()
    }

    setPinAction(null)
  }

  const handleDeleteAllEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/employees/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ superadminPin: '0147' })
      })

      if (response.ok) {
        setImportResult({ success: true, message: t('tousEmployesSupprimés') })
      } else {
        const data = await response.json()
        setImportResult({ success: false, message: data.error || t('erreur') })
      }
    } catch (error) {
      setImportResult({ success: false, message: t('erreurConnexion') })
    }
  }

  const handleImportFile = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:3001/api/employees/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setImportResult({
          success: true,
          message: `${data.imported} ${t('employesImportes')}`
        })
        setFile(null)
      } else {
        setImportResult({ success: false, message: data.error || t('erreur') })
      }
    } catch (error) {
      setImportResult({ success: false, message: t('erreurConnexion') })
    }
  }

  const loadAdmins = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admins')
      const data = await response.json()
      setAdmins(data.data || [])
    } catch (error) {
      console.error('Error loading admins:', error)
    }
  }

  const handleAddAdmin = async () => {
    if (newAdmin.pin !== newAdmin.confirmPin) {
      alert(t('pinsNeCorrespondentPas'))
      return
    }

    if (newAdmin.pin.length !== 4) {
      alert(t('pinDoit4Chiffres'))
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdmin.name,
          role: 'Admin',
          pin: newAdmin.pin
        })
      })

      if (response.ok) {
        setNewAdmin({ name: '', pin: '', confirmPin: '' })
        setShowAddAdmin(false)
        await loadAdmins()
      }
    } catch (error) {
      console.error('Error adding admin:', error)
    }
  }

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm(t('confirmerSuppressionAdmin'))) return

    try {
      const response = await fetch(`http://localhost:3001/api/admins/${adminId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadAdmins()
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
    }
  }

  const loadDatabaseSchema = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/database/schema', {
        headers: { 'x-superadmin-pin': '0147' }
      })
      const data = await response.json()
      setDbSchema(data.schema || [])
    } catch (error) {
      console.error('Error loading schema:', error)
    }
  }

  const handleAddColumn = async () => {
    if (!newColumn.name || !selectedTable) return

    try {
      const response = await fetch('http://localhost:3001/api/database/add-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-pin': '0147'
        },
        body: JSON.stringify({
          tableName: selectedTable.name,
          columnName: newColumn.name,
          columnType: newColumn.type,
          nullable: newColumn.nullable
        })
      })

      if (response.ok) {
        await loadDatabaseSchema()
        setShowAddColumn(false)
        setNewColumn({ name: '', type: 'String', nullable: false })
      }
    } catch (error) {
      console.error('Error adding column:', error)
    }
  }

  const handleEditColumn = async (oldName, newName, newType) => {
    if (!selectedTable || !newName) return

    try {
      const response = await fetch('http://localhost:3001/api/database/edit-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-pin': '0147'
        },
        body: JSON.stringify({
          tableName: selectedTable.name,
          oldColumnName: oldName,
          newColumnName: newName,
          newColumnType: newType
        })
      })

      if (response.ok) {
        await loadDatabaseSchema()
        setEditingColumn(null)
      }
    } catch (error) {
      console.error('Error editing column:', error)
    }
  }

  const handleDeleteColumn = async (columnName) => {
    if (!selectedTable || !window.confirm(`Delete column "${columnName}"?`)) return

    try {
      const response = await fetch('http://localhost:3001/api/database/delete-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-pin': '0147'
        },
        body: JSON.stringify({
          tableName: selectedTable.name,
          columnName
        })
      })

      if (response.ok) {
        await loadDatabaseSchema()
      }
    } catch (error) {
      console.error('Error deleting column:', error)
    }
  }

  // Load admins when switching to admins section
  if (activeSection === 'admins' && admins.length === 0) {
    loadAdmins()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-[#E8EFF8] flex items-center gap-3">
          <Settings className="w-7 h-7" />
          {t('parametres')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#7A9CC4] mt-1">
          {t('configurationSysteme')}
        </p>
      </div>

      {/* Section Tabs */}
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 inline-flex gap-2"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.12)'
        } : {}}
      >
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-navy text-white shadow-lg'
                  : 'text-gray-600 dark:text-[#7A9CC4] hover:bg-black/5 dark:hover:bg-[rgba(99,157,255,0.08)]'
              }`}
              style={isActive && isDark ? {
                background: 'linear-gradient(135deg, #2A5494, #1E3D6B)'
              } : {}}
            >
              <Icon className="w-4 h-4" />
              {t(section.labelKey)}
            </button>
          )
        })}
      </div>

      {/* Section Content */}
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.12)',
          boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
        } : {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Employee Data Management */}
        {activeSection === 'data' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E8EFF8] mb-4">
                {t('gestionDonneesEmployes')}
              </h2>

              {/* Import Section */}
              <div className="space-y-4">
                <div
                  className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                  style={isDark ? {
                    backgroundColor: 'rgba(99,157,255,0.08)',
                    borderColor: 'rgba(99,157,255,0.2)'
                  } : {}}
                >
                  <h3 className="font-medium text-blue-900 dark:text-[#639DFF] mb-2">
                    {t('importerEmployes')}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-[#639DFF]/80 mb-4">
                    {t('importerDepuisCsvJson')}
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="flex-1 text-sm text-gray-600 dark:text-[#7A9CC4] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-[rgba(99,157,255,0.15)] dark:file:text-[#639DFF]"
                    />
                    <button
                      onClick={handleImportFile}
                      disabled={!file}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {t('importer')}
                    </button>
                  </div>
                </div>

                {/* Delete All Section */}
                <div
                  className="p-4 bg-red-50 border border-red-200 rounded-xl"
                  style={isDark ? {
                    backgroundColor: 'rgba(192,57,43,0.1)',
                    borderColor: 'rgba(255,59,48,0.2)'
                  } : {}}
                >
                  <h3 className="font-medium text-red-900 dark:text-[#FF6B6B] mb-2">
                    {t('supprimerTousEmployes')}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-[#FF6B6B]/80 mb-4">
                    {t('actionIrreversible')}
                  </p>
                  <button
                    onClick={() => {
                      setPinAction('delete-all')
                      setShowPinModal(true)
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('supprimerTout')}
                  </button>
                </div>

                {/* Result Message */}
                {importResult && (
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      importResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                    style={isDark ? (
                      importResult.success
                        ? { backgroundColor: 'rgba(52,199,89,0.1)', borderColor: 'rgba(52,199,89,0.2)' }
                        : { backgroundColor: 'rgba(192,57,43,0.1)', borderColor: 'rgba(255,59,48,0.2)' }
                    ) : {}}
                  >
                    {importResult.success ? (
                      <Check className="w-5 h-5 text-green-600 dark:text-[#34C759]" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-[#FF6B6B]" />
                    )}
                    <p className={`text-sm ${
                      importResult.success
                        ? 'text-green-700 dark:text-[#34C759]'
                        : 'text-red-700 dark:text-[#FF6B6B]'
                    }`}>
                      {importResult.message}
                    </p>
                    <button
                      onClick={() => setImportResult(null)}
                      className="ml-auto"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Management */}
        {activeSection === 'admins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E8EFF8]">
                {t('gestionAdmins')}
              </h2>
              <button
                onClick={() => setShowAddAdmin(!showAddAdmin)}
                className="px-4 py-2 bg-navy text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                style={isDark ? {
                  background: 'linear-gradient(135deg, #2A5494, #1E3D6B)'
                } : {}}
              >
                <UserPlus className="w-4 h-4" />
                {t('ajouterAdmin')}
              </button>
            </div>

            {/* Add Admin Form */}
            {showAddAdmin && (
              <div
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.05)',
                  borderColor: 'rgba(99,157,255,0.15)'
                } : {}}
              >
                <input
                  type="text"
                  placeholder={t('nomAdmin')}
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[rgba(99,157,255,0.2)] rounded-lg bg-white dark:bg-[rgba(99,157,255,0.05)] text-gray-900 dark:text-[#E8EFF8]"
                />
                <input
                  type="password"
                  placeholder={t('pinPersonnalise')}
                  value={newAdmin.pin}
                  onChange={(e) => setNewAdmin({ ...newAdmin, pin: e.target.value })}
                  maxLength={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[rgba(99,157,255,0.2)] rounded-lg bg-white dark:bg-[rgba(99,157,255,0.05)] text-gray-900 dark:text-[#E8EFF8]"
                />
                <input
                  type="password"
                  placeholder={t('confirmerPin')}
                  value={newAdmin.confirmPin}
                  onChange={(e) => setNewAdmin({ ...newAdmin, confirmPin: e.target.value })}
                  maxLength={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[rgba(99,157,255,0.2)] rounded-lg bg-white dark:bg-[rgba(99,157,255,0.05)] text-gray-900 dark:text-[#E8EFF8]"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddAdmin(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-[rgba(99,157,255,0.2)] rounded-lg text-gray-700 dark:text-[#7A9CC4] hover:bg-gray-100 dark:hover:bg-[rgba(99,157,255,0.08)]"
                  >
                    {t('annuler')}
                  </button>
                  <button
                    onClick={handleAddAdmin}
                    className="flex-1 px-4 py-2 bg-navy text-white rounded-lg hover:opacity-90"
                    style={isDark ? {
                      background: 'linear-gradient(135deg, #2A5494, #1E3D6B)'
                    } : {}}
                  >
                    {t('ajouter')}
                  </button>
                </div>
              </div>
            )}

            {/* Admins List */}
            <div className="grid gap-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[rgba(99,157,255,0.05)] rounded-xl"
                  style={isDark ? {
                    backgroundColor: 'rgba(99,157,255,0.05)',
                    border: '1px solid rgba(99,157,255,0.1)'
                  } : {}}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-[#E8EFF8]">{admin.name}</div>
                    <div className="text-sm text-gray-600 dark:text-[#7A9CC4]">{admin.role}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="p-2 text-red-600 dark:text-[#FF6B6B] hover:bg-red-100 dark:hover:bg-[rgba(192,57,43,0.15)] rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Schema Viewer */}
        {activeSection === 'database' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E8EFF8] mb-4">
                {t('structureDatabase')}
              </h2>

              {!dbSchema ? (
                <button
                  onClick={() => {
                    setPinAction('view-database')
                    setShowPinModal(true)
                  }}
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                  style={isDark ? {
                    background: 'linear-gradient(135deg, #2A5494, #1E3D6B)'
                  } : {}}
                >
                  <Database className="w-4 h-4" />
                  {t('voirStructure')}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {dbSchema.map((table) => (
                      <button
                        key={table.name}
                        onClick={() => setSelectedTable(table)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedTable?.name === table.name
                            ? 'bg-navy text-white'
                            : 'bg-gray-50 dark:bg-[rgba(99,157,255,0.05)] hover:bg-gray-100 dark:hover:bg-[rgba(99,157,255,0.1)]'
                        }`}
                        style={selectedTable?.name === table.name && isDark ? {
                          background: 'linear-gradient(135deg, #2A5494, #1E3D6B)'
                        } : {}}
                      >
                        <div className="font-medium">{table.name}</div>
                        <div className={`text-sm ${
                          selectedTable?.name === table.name
                            ? 'text-white/80'
                            : 'text-gray-600 dark:text-[#7A9CC4]'
                        }`}>
                          {table.columns.length} {t('colonnes')}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedTable && (
                    <div
                      className="p-4 bg-gray-50 dark:bg-[rgba(99,157,255,0.05)] rounded-xl"
                      style={isDark ? {
                        backgroundColor: 'rgba(99,157,255,0.05)',
                        border: '1px solid rgba(99,157,255,0.1)'
                      } : {}}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-[#E8EFF8]">
                          {selectedTable.name}
                        </h3>
                        <button
                          onClick={() => setShowAddColumn(true)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Column
                        </button>
                      </div>

                      <div className="space-y-2">
                        {selectedTable.columns.map((col) => (
                          <div key={col.name}>
                            {editingColumn === col.name ? (
                              <div className="flex items-center gap-2 p-2 bg-white dark:bg-[rgba(99,157,255,0.08)] rounded-lg">
                                <input
                                  type="text"
                                  defaultValue={col.name}
                                  className="flex-1 px-2 py-1 text-sm font-mono border rounded dark:bg-[#0B1120] dark:border-[rgba(99,157,255,0.2)] dark:text-[#E8EFF8]"
                                  id={`edit-name-${col.name}`}
                                />
                                <input
                                  type="text"
                                  defaultValue={col.type}
                                  className="w-24 px-2 py-1 text-sm border rounded dark:bg-[#0B1120] dark:border-[rgba(99,157,255,0.2)] dark:text-[#E8EFF8]"
                                  id={`edit-type-${col.name}`}
                                />
                                <button
                                  onClick={() => {
                                    const newName = document.getElementById(`edit-name-${col.name}`).value
                                    const newType = document.getElementById(`edit-type-${col.name}`).value
                                    handleEditColumn(col.name, newName, newType)
                                  }}
                                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingColumn(null)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/20 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-2 bg-white dark:bg-[rgba(99,157,255,0.08)] rounded-lg">
                                <span className="font-mono text-sm text-gray-900 dark:text-[#E8EFF8]">
                                  {col.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600 dark:text-[#7A9CC4] bg-gray-100 dark:bg-[rgba(99,157,255,0.1)] px-2 py-1 rounded">
                                    {col.type}
                                  </span>
                                  <button
                                    onClick={() => setEditingColumn(col.name)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteColumn(col.name)}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Column Form */}
                      {showAddColumn && (
                        <div className="mt-4 p-3 bg-white dark:bg-[rgba(99,157,255,0.08)] rounded-lg border-2 border-green-200 dark:border-green-600/30">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-[#E8EFF8] mb-3">
                            Add New Column
                          </h4>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Column name"
                              value={newColumn.name}
                              onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                              className="w-full px-3 py-2 text-sm border rounded dark:bg-[#0B1120] dark:border-[rgba(99,157,255,0.2)] dark:text-[#E8EFF8]"
                            />
                            <select
                              value={newColumn.type}
                              onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                              className="w-full px-3 py-2 text-sm border rounded dark:bg-[#0B1120] dark:border-[rgba(99,157,255,0.2)] dark:text-[#E8EFF8]"
                            >
                              <option value="String">String</option>
                              <option value="Int">Int</option>
                              <option value="DateTime">DateTime</option>
                              <option value="Boolean">Boolean</option>
                              <option value="Float">Float</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#7A9CC4]">
                              <input
                                type="checkbox"
                                checked={newColumn.nullable}
                                onChange={(e) => setNewColumn({ ...newColumn, nullable: e.target.checked })}
                                className="rounded"
                              />
                              Nullable
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={handleAddColumn}
                                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddColumn(false)
                                  setNewColumn({ name: '', type: 'String', nullable: false })
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#7A9CC4] bg-gray-100 dark:bg-[rgba(99,157,255,0.1)] hover:bg-gray-200 dark:hover:bg-[rgba(99,157,255,0.15)] rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Superadmin PIN Modal */}
      <SuperAdminPinModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false)
          setPinAction(null)
        }}
        onSuccess={handlePinVerified}
        title={t('verificationSuperadmin')}
      />
    </div>
  )
}
