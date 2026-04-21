# TODO.md - Gaming Day Admin Panel Implementation

## Status: In Progress [1/11]

### Phase 1: Preparation [2/2] ✅
- [x] 1. Create this TODO.md file
- [x] 2. Define default data JSON (extract from index.html current content → defaults.js)

### Phase 2: Implement admin.html [1/4] ✅
- [x] 3. Create full admin.html with Tailwind styles matching index.html
- [ ] 4. Add password protection (prompt 'admin')
- [ ] 5. Implement Próximo Torneo tab/form/preview
- [ ] 6. Implement Reglas tab/form/preview  
- [ ] 7. Implement Galería tab/form/preview
- [ ] 4. Add password protection (prompt 'admin')
- [ ] 5. Implement Próximo Torneo tab/form/preview
- [ ] 6. Implement Reglas tab/form/preview  
- [ ] 7. Implement Galería tab/form/preview

### Phase 3: Update index.html [3/3] ✅
- [x] 8. Add localStorage load/render functions for all 3 sections (admin-script.js)
- [x] 9. Add hidden Admin button (floating purple button, password 'admin' → admin.html)
- [x] 10. Replace static sections with dynamic containers (#torneo-content, #reglas-list, #slider)
- [ ] 9. Add hidden Admin button (header/footer) with password check → open admin.html
- [ ] 10. Replace static sections with dynamic render calls + init defaults

### Phase 4: Testing & Completion [0/1]
- [x] 11. Test full flow: edit in admin → save → refresh index → verify changes
