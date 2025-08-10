# Purchase Order Complete Workflow

## Aliran Proses Purchase Order

### 1. Purchase Order (PO) Creation
- **Status**: Draft → Ordered
- **Tabel**: `purchase_orders`, `purchase_order_items`
- **Jurnal**: Tidak ada (belum ada transaksi keuangan)

### 2. Purchase Receipt (Penerimaan Barang)
- **Status PO**: `received_status` → Pending → Partial → Completed
- **Tabel**: `purchase_receipts`, `purchase_receipt_items`
- **Jurnal Otomatis**:
  ```
  Debit: Persediaan (1300)     Rp XXX
  Credit: Hutang Dagang (2100) Rp XXX
  ```

### 3. Bill Creation (Tagihan dari Vendor)
- **Status PO**: `billed_status` → Not Billed → Partial → Fully Billed
- **Tabel**: `bills`, `bill_items`
- **Jurnal**: Opsional (tergantung kebijakan akuntansi)

### 4. Vendor Payment (Pembayaran ke Vendor)
- **Status Bill**: `payment_status` → Unpaid → Partial → Paid
- **Tabel**: `vendor_payments`
- **Jurnal Otomatis**:
  ```
  Debit: Hutang Dagang (2100)  Rp XXX
  Credit: Kas/Bank (1100/1200) Rp XXX
  ```

### 5. Journal Entries (Pencatatan Akuntansi)
- **Tabel**: `journal_entries`, `journal_items`
- **Status**: Draft → Posted → Reversed
- **Auto-generated** untuk Receipt dan Payment
- **Manual entry** untuk adjustment

## Fitur Utama

### Soft Delete
- Semua tabel menggunakan `deleted_at` untuk soft delete
- Data tidak benar-benar dihapus, hanya ditandai sebagai deleted
- Query selalu filter `deleted_at IS NULL`

### Partial Operations
- **Partial Receipt**: Bisa terima sebagian barang dari PO
- **Partial Billing**: Bisa buat tagihan untuk sebagian barang yang diterima
- **Partial Payment**: Bisa bayar sebagian dari total tagihan

### Status Tracking
- **Purchase Order**: Draft, Ordered, Cancelled
- **Receipt Status**: Pending, Partial, Completed
- **Billing Status**: Not Billed, Partial, Fully Billed
- **Payment Status**: Unpaid, Partial, Paid

### Automatic Journal Entries
- **Receipt**: Debit Inventory, Credit Accounts Payable
- **Payment**: Debit Accounts Payable, Credit Cash/Bank
- **Reversal**: Otomatis reverse dengan swap debit/credit

## Database Schema

### New Tables Created:
1. `purchase_receipts` - Penerimaan barang
2. `purchase_receipt_items` - Detail penerimaan
3. `bills` - Tagihan vendor (enhanced)
4. `bill_items` - Detail tagihan (enhanced)
5. `vendor_payments` - Pembayaran vendor
6. `journal_entries` - Jurnal akuntansi (enhanced)
7. `journal_items` - Detail jurnal (enhanced)

### Enhanced Existing Tables:
- `purchase_orders`: Added status tracking columns
- `purchase_order_items`: Added received/billed quantity tracking

## COA (Chart of Accounts) Structure
- **1100**: Kas
- **1200**: Bank
- **1300**: Persediaan
- **2100**: Hutang Dagang
- **5100**: Beban Pembelian
- **5200**: Beban Administrasi

## Implementation Notes

### Services Created:
- `PurchaseReceiptService`: Manage penerimaan barang
- `BillService`: Enhanced bill management
- `VendorPaymentService`: Manage pembayaran vendor
- `JournalEntryService`: Enhanced journal management

### Components to Create:
- `PurchaseReceiptManagement`: UI untuk penerimaan barang
- Enhanced `BillManagement`: UI untuk tagihan vendor
- `VendorPaymentManagement`: UI untuk pembayaran vendor
- Enhanced `JournalEntryManagement`: UI untuk jurnal akuntansi

### Key Features:
1. **Workflow Integration**: Setiap step terintegrasi dengan step berikutnya
2. **Automatic Journal**: Jurnal otomatis untuk transaksi keuangan
3. **Status Tracking**: Real-time status tracking di setiap level
4. **Soft Delete**: Data preservation dengan soft delete
5. **Partial Operations**: Support untuk operasi parsial
6. **Audit Trail**: Complete audit trail dengan timestamps

## Next Steps untuk AI Implementation:

1. **Enhance existing PurchaseOrderPage** dengan workflow buttons
2. **Create PurchaseReceiptPage** untuk penerimaan barang
3. **Enhance BillsPage** dengan integration ke PO
4. **Create VendorPaymentPage** untuk pembayaran
5. **Enhance JournalEntriesPage** dengan auto-generated entries
6. **Add workflow status indicators** di dashboard
7. **Create reports** untuk purchase analysis