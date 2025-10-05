'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'upload' | 'mapping' | 'validation' | 'import' | 'complete';

export default function ImportWizardPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [supplierId, setSupplierId] = useState('manual-import');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  // Validation state
  const [validationResult, setValidationResult] = useState<any>(null);
  
  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Field options
  const dbFields = [
    { value: '', label: '-- Seçiniz --' },
    { value: 'vendorOfferId', label: 'Vendor Offer ID (Opsiyonel)' },
    { value: 'title', label: 'Başlık *' },
    { value: 'description', label: 'Açıklama' },
    { value: 'category', label: 'Kategori * (tours/flights/buses/ships)' },
    { value: 'startLocation', label: 'Nereden *' },
    { value: 'endLocation', label: 'Nereye *' },
    { value: 'startAt', label: 'Başlangıç Tarihi * (YYYY-MM-DD)' },
    { value: 'endAt', label: 'Bitiş Tarihi (YYYY-MM-DD)' },
    { value: 'price', label: 'Fiyat * (örn: 150.50)' },
    { value: 'currency', label: 'Para Birimi * (TRY/USD/EUR)' },
    { value: 'availableSeats', label: 'Koltuk Sayısı' },
    { value: 'images', label: 'Görseller (virgülle ayrılmış URL\'ler)' },
    { value: 'highlights', label: 'Öne Çıkanlar (| ile ayrılmış)' },
    { value: 'included', label: 'Dahil Olanlar (| ile ayrılmış)' },
    { value: 'excluded', label: 'Dahil Olmayanlar (| ile ayrılmış)' },
  ];

  // Fetch suppliers on mount
  useState(() => {
    fetch('/api/admin/suppliers')
      .then(res => res.json())
      .then(data => setSuppliers(data.suppliers || []));
  });

  // Step 1: Upload CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('/api/admin/import/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setColumns(data.columns);
        setPreview(data.preview);
        setTotalRows(data.totalRows);
        setFileContent(data.fileContent);
        setStep('mapping');
      } else {
        alert('CSV parse hatası: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Dosya yüklenemedi');
    }
  };

  // Step 2: Validate mapping
  const handleValidate = async () => {
    // Check required fields are mapped
    const requiredFields = ['title', 'category', 'startLocation', 'endLocation', 'startAt', 'price', 'currency'];
    const mappedFields = Object.values(mapping);
    
    for (const field of requiredFields) {
      if (!mappedFields.includes(field)) {
        alert(`Zorunlu alan eşleştirilmedi: ${field}`);
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent,
          mapping,
          supplierId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult(data);
        setStep('validation');
      } else {
        alert('Validasyon hatası: ' + data.error);
      }
    } catch (error) {
      console.error('Validation error:', error);
      alert('Validasyon başarısız');
    }
  };

  // Step 3: Execute import
  const handleImport = async () => {
    setIsImporting(true);

    try {
      const response = await fetch('/api/admin/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent,
          mapping,
          supplierId,
        }),
      });

      const data = await response.json();
      setImportResult(data);
      setIsImporting(false);
      setStep('complete');
    } catch (error) {
      console.error('Import error:', error);
      alert('Import başarısız');
      setIsImporting(false);
    }
  };

  // Download error CSV
  const handleDownloadErrors = () => {
    if (!importResult?.errorCSV) return;

    const blob = new Blob([importResult.errorCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📥 Veri İçe Aktar</h1>
          <p className="text-gray-600 mt-1">CSV dosyasından toplu offer içe aktarma</p>
        </div>
        <Link
          href="/admin/offers"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Envanter
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          {(['upload', 'mapping', 'validation', 'complete'] as Step[]).map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : index < (['upload', 'mapping', 'validation', 'complete'] as Step[]).indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < (['upload', 'mapping', 'validation', 'complete'] as Step[]).indexOf(step) ? '✓' : index + 1}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {s === 'upload' && 'Dosya Yükle'}
                  {s === 'mapping' && 'Sütun Eşleştir'}
                  {s === 'validation' && 'Validasyon'}
                  {s === 'complete' && 'Tamamlandı'}
                </div>
              </div>
              {index < 3 && <div className="mx-6 h-0.5 w-16 bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. CSV Dosyası Yükle</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              CSV dosyanızı seçin
            </h3>
            <p className="text-gray-600 mb-4">
              Virgülle veya noktalı virgülle ayrılmış değerler (CSV)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="inline-block px-6 py-3 bg-[#563C5C] text-white rounded-lg hover:bg-[#563C5C]/90 cursor-pointer transition-colors"
            >
              Dosya Seç
            </label>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 CSV Formatı</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• İlk satır sütun başlıkları olmalıdır</li>
              <li>• Zorunlu alanlar: title, category, startLocation, endLocation, startAt, price, currency</li>
              <li>• Tarih formatı: YYYY-MM-DD veya YYYY-MM-DDTHH:mm:ss</li>
              <li>• Kategori: tours, flights, buses, ships</li>
              <li>• Para birimi: TRY, USD, EUR</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'mapping' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. Sütun Eşleştirme</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tedarikçi (Opsiyonel)
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manual-import">Manuel Import</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              CSV sütunlarınızı veritabanı alanlarıyla eşleştirin. Toplam {totalRows} satır bulundu.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {columns.map(col => (
              <div key={col} className="flex items-center gap-4">
                <div className="w-1/3 font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded">
                  {col}
                </div>
                <div className="text-gray-400">→</div>
                <select
                  value={mapping[col] || ''}
                  onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dbFields.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Önizleme (İlk 5 Satır)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map(col => (
                        <th key={col} className="px-3 py-2 text-left border-b border-gray-200 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {columns.map(col => (
                          <td key={col} className="px-3 py-2">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('upload')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Geri
            </button>
            <button
              onClick={handleValidate}
              className="flex-1 px-6 py-3 bg-[#563C5C] text-white rounded-lg hover:bg-[#563C5C]/90 transition-colors font-semibold"
            >
              Devam Et →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Validation */}
      {step === 'validation' && validationResult && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. Validasyon Sonuçları</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{validationResult.totalRows}</div>
              <div className="text-sm text-gray-600 mt-1">Toplam Satır</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{validationResult.validRows}</div>
              <div className="text-sm text-green-600 mt-1">Geçerli</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-700">{validationResult.invalidRows}</div>
              <div className="text-sm text-red-600 mt-1">Hatalı</div>
            </div>
          </div>

          {validationResult.invalidRows > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Hata Önizlemesi (İlk 10)</h3>
              <div className="space-y-2">
                {validationResult.errorPreview.map((err: any, i: number) => (
                  <div key={i} className="text-sm text-yellow-800 bg-white rounded p-2">
                    <strong>Satır {err.row}:</strong> {err.field} - {err.error}
                    {err.value && <span className="text-gray-600"> (Değer: {err.value})</span>}
                  </div>
                ))}
              </div>
              <p className="text-sm text-yellow-700 mt-3">
                Hatalı satırlar import edilmeyecek. Import sonunda detaylı error.csv indirebilirsiniz.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('mapping')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Geri
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="flex-1 px-6 py-3 bg-[#563C5C] text-white rounded-lg hover:bg-[#563C5C]/90 transition-colors font-semibold disabled:opacity-50"
            >
              {isImporting ? '⏳ İçe Aktarılıyor...' : '✓ İçe Aktar'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && importResult && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {importResult.success ? '✅' : '⚠️'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {importResult.success ? 'İçe Aktarma Tamamlandı!' : 'İçe Aktarma Tamamlandı (Hatalarla)'}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{importResult.imported}</div>
              <div className="text-sm text-green-600 mt-1">Başarılı</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-700">{importResult.failed}</div>
              <div className="text-sm text-red-600 mt-1">Başarısız</div>
            </div>
          </div>

          {importResult.errorCSV && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-3">📄 Hata Raporu</h3>
              <p className="text-sm text-yellow-800 mb-3">
                {importResult.failed} satır hata içeriyor. Detayları görmek için error.csv dosyasını indirin.
              </p>
              <button
                onClick={handleDownloadErrors}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                📥 error.csv İndir
              </button>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/admin/offers"
              className="flex-1 px-6 py-3 bg-[#563C5C] text-white rounded-lg hover:bg-[#563C5C]/90 transition-colors font-semibold text-center"
            >
              Envantere Git →
            </Link>
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setFileContent('');
                setColumns([]);
                setMapping({});
                setValidationResult(null);
                setImportResult(null);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Yeni Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

