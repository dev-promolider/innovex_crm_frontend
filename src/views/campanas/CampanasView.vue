<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">
        Inicio ›
        <span v-if="!campanaSeleccionada"><strong>Campañas</strong></span>
        <span v-else>
          <a href="#" @click.prevent="volverALista" class="breadcrumb-link">Campañas</a>
          › <strong>{{ campanaSeleccionada.nombre }}</strong>
        </span>
      </span>
    </template>

    <!-- ══════════════════════════════════════════════ -->
    <!-- VISTA 1: LISTA DE CAMPAÑAS                    -->
    <!-- ══════════════════════════════════════════════ -->
    <div v-if="!campanaSeleccionada" class="page-body">

        <div v-if="errorMsg" class="alert-error">
          {{ errorMsg }}
          <button @click="errorMsg = ''" class="alert-close">✕</button>
        </div>

        <div v-if="successMsg" class="alert-success">
          {{ successMsg }}
          <button @click="successMsg = ''" class="alert-close">✕</button>
        </div>

        <div class="page-header">
          <div>
            <h1 class="page-title">Campañas y Kits</h1>
            <p class="page-subtitle">
              <span v-if="cargando">Cargando...</span>
              <span v-else>{{ meta.total ?? campanas.length }} campañas encontradas</span>
            </p>
          </div>
          <button class="btn-primary" @click="abrirModalCampana()">+ Nueva Campaña</button>
        </div>

        <div class="content-layout">
          <!-- Panel filtros -->
          <aside class="filters-panel">
            <h3 class="filters-title">Filtros</h3>
            <div class="filter-section">
              <label class="filter-label">Estado</label>
              <div class="filter-options">
                <label v-for="op in opcionesEstado" :key="op.value"
                       class="filter-radio" :class="{ active: filtroEstado === op.value }"
                       @click="filtroEstado = op.value">
                  <input type="radio" v-model="filtroEstado" :value="op.value" />
                  <span class="radio-dot" :style="{ background: op.color }"></span>
                  {{ op.label }}
                </label>
              </div>
            </div>
            <div class="filter-section">
              <label class="filter-label">Rango de Fechas</label>
              <DatePicker
                id="campaign-filter-start-date"
                v-model="fechaInicio"
                label="Fecha inicio"
                :range-start="fechaInicio"
                :range-end="fechaFin"
              />
              <DatePicker
                id="campaign-filter-end-date"
                v-model="fechaFin"
                label="Fecha fin"
                :min="fechaInicio"
                :range-start="fechaInicio"
                :range-end="fechaFin"
              />
            </div>
            <div class="filter-section resumen-box">
              <h4 class="resumen-title">Resumen</h4>
              <div class="resumen-row"><span>Total campañas</span><span class="resumen-val">{{ meta.total ?? campanas.length }}</span></div>
              <div class="resumen-row"><span>Activas</span><span class="resumen-val">{{ contarEstado('activa') }}</span></div>
              <div class="resumen-row"><span>Kits definidos</span><span class="resumen-val">{{ totalKitsDefinidos }}</span></div>
              <div class="resumen-row"><span>Ventas validadas</span><span class="resumen-val">—</span></div>
            </div>
          </aside>

          <div class="campaign-list-area">
            <div class="campaign-list-toolbar">
              <div class="search-box">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" v-model="busqueda" placeholder="Buscar campaña..." class="search-input" aria-label="Buscar campaña" />
              </div>
            </div>

            <div v-if="cargando" class="campaign-card-list" aria-label="Cargando campañas" aria-busy="true">
              <div v-for="index in 3" :key="index" class="campaign-skeleton">
                <div class="campaign-skeleton-image"></div>
                <div class="campaign-skeleton-copy">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>

            <div v-else-if="campaignListError" class="campaign-load-error" role="alert">
              <p>{{ campaignListError }}</p>
              <button type="button" class="btn-outline" @click="cargarCampanas(meta.current_page)">Reintentar</button>
            </div>

            <div v-else-if="campanasFiltradas.length === 0" class="campaign-empty-state">
              No se encontraron campañas.
            </div>

            <div v-else class="campaign-card-list">
              <article v-for="c in campanasFiltradas" :key="c.id" class="campaign-card">
                <div class="campaign-card-heading">
                  <button
                    type="button"
                    class="campaign-card-toggle"
                    :aria-expanded="campanaExpandidaId === c.id"
                    :aria-controls="`campaign-catalog-${c.id}`"
                    @click="toggleCatalogoCampana(c)"
                  >
                    <span class="campaign-card-image">
                      <img
                        v-if="c.imagen_url && !imagenFallida(c.imagen_url)"
                        :src="c.imagen_url"
                        :alt="`Imagen de ${c.nombre}`"
                        loading="lazy"
                        @error="marcarImagenFallida(c.imagen_url)"
                      />
                      <span v-else class="campaign-image-placeholder" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7">
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </span>
                    </span>
                    <span class="campaign-card-copy">
                      <span class="campaign-card-title">{{ c.nombre }}</span>
                      <span class="campaign-card-meta">
                        <span class="badge" :class="'estado-' + c.estado">{{ c.estado }}</span>
                        <span>{{ formatFecha(c.fecha_inicio) }} — {{ formatFecha(c.fecha_fin) }}</span>
                        <span>{{ kitsMeta[c.id]?.total ?? '—' }} kits</span>
                      </span>
                    </span>
                    <span class="campaign-card-chevron" aria-hidden="true">{{ campanaExpandidaId === c.id ? '−' : '+' }}</span>
                  </button>
                  <div class="campaign-card-actions">
                    <button type="button" class="btn-action" @click="abrirModalCampana(c)">Editar</button>
                    <button type="button" class="btn-action" @click="verDetalle(c)">Administrar</button>
                  </div>
                </div>

                <section
                  v-show="campanaExpandidaId === c.id"
                  :id="`campaign-catalog-${c.id}`"
                  class="campaign-catalog"
                  :aria-label="`Catálogo de kits de ${c.nombre}`"
                >
                  <div class="campaign-catalog-heading">
                    <h2>Kits de la campaña</h2>
                    <button type="button" class="btn-primary" @click="crearKitParaCampana(c)">Agregar kit</button>
                  </div>
                  <div v-if="catalogosEstado[c.id] === 'loading'" class="kit-catalog-grid" aria-label="Cargando kits" aria-busy="true">
                    <div v-for="index in 3" :key="index" class="kit-skeleton">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div v-else-if="catalogosEstado[c.id] === 'error'" class="campaign-load-error" role="alert">
                    <p>{{ erroresCatalogo[c.id] || 'No se pudo cargar el catálogo de esta campaña.' }}</p>
                    <button type="button" class="btn-outline" @click="cargarCatalogoCampana(c.id)">Reintentar</button>
                  </div>
                  <p v-else-if="!(catalogosKits[c.id]?.length)" class="campaign-catalog-empty">
                    Esta campaña aún no tiene kits
                  </p>
                  <div v-else class="kit-catalog-grid">
                    <article v-for="kit in catalogosKits[c.id]" :key="kit.id" class="kit-catalog-card">
                      <button type="button" class="kit-catalog-open" @click="verDetalleKit(kit)">
                        <span class="kit-catalog-image">
                          <img
                            v-if="kit.imagen_url && !imagenFallida(kit.imagen_url)"
                            :src="kit.imagen_url"
                            :alt="`Imagen de ${kit.nombre}`"
                            loading="lazy"
                            @error="marcarImagenFallida(kit.imagen_url)"
                          />
                          <span v-else class="campaign-image-placeholder" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7">
                              <rect x="3" y="3" width="18" height="18" rx="3" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </span>
                        </span>
                        <span class="kit-catalog-title">{{ kit.nombre }}</span>
                        <span class="badge" :class="kit.activo ? 'estado-activa' : 'estado-borrador'">
                          {{ kit.activo ? 'Activo' : 'Inactivo' }}
                        </span>
                      </button>
                      <ul v-if="productosKitCatalogo(kit).length" class="kit-product-list">
                        <li v-for="(producto, index) in productosKitCatalogo(kit)" :key="`${kit.id}-${index}`">
                          <span class="kit-product-image">
                            <img
                              v-if="producto.imagen_url && !imagenFallida(producto.imagen_url)"
                              :src="producto.imagen_url"
                              :alt="`Imagen de ${producto.nombre}`"
                              loading="lazy"
                              @error="marcarImagenFallida(producto.imagen_url)"
                            />
                            <span v-else class="campaign-image-placeholder" aria-hidden="true">▧</span>
                          </span>
                          <span class="kit-product-copy">
                            <strong>{{ producto.nombre }}</strong>
                            <small>{{ producto.descripcion || 'Sin descripción' }}</small>
                          </span>
                        </li>
                      </ul>
                    </article>
                  </div>
                </section>
              </article>
            </div>
            <div v-if="!cargando && !campaignListError && meta.last_page > 1" class="pagination">
              <button :disabled="meta.current_page === 1" @click="cambiarPagina(meta.current_page - 1)" class="page-btn">‹</button>
              <span class="page-info">Página {{ meta.current_page }} de {{ meta.last_page }}</span>
              <button :disabled="meta.current_page === meta.last_page" @click="cambiarPagina(meta.current_page + 1)" class="page-btn">›</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════ -->
      <!-- VISTA 2: DETALLE DE CAMPAÑA + KITS            -->
      <!-- ══════════════════════════════════════════════ -->
      <div v-else class="page-body">

        <div v-if="errorMsg" class="alert-error">
          {{ errorMsg }}
          <button @click="errorMsg = ''" class="alert-close">✕</button>
        </div>

        <div v-if="successMsg" class="alert-success">
          {{ successMsg }}
          <button @click="successMsg = ''" class="alert-close">✕</button>
        </div>

        <div class="detalle-header">
          <button class="btn-back" @click="volverALista">← Volver</button>
          <div class="detalle-info">
            <div>
              <h1 class="page-title">{{ campanaSeleccionada.nombre }}</h1>
              <p class="page-subtitle">{{ campanaSeleccionada.descripcion ?? 'Sin descripción' }}</p>
            </div>
            <div class="detalle-meta">
              <span class="badge" :class="'estado-' + campanaSeleccionada.estado">{{ campanaSeleccionada.estado }}</span>
              <span class="meta-fechas">{{ formatFecha(campanaSeleccionada.fecha_inicio) }} — {{ formatFecha(campanaSeleccionada.fecha_fin) }}</span>
            </div>
          </div>
          <div class="detalle-acciones">
            <button
              v-if="campanaSeleccionada.estado === 'borrador'"
              class="btn-primary"
              @click="cambiarEstadoCampana('activar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Activar' }}
            </button>
            <button
              v-if="campanaSeleccionada.estado === 'activa'"
              class="btn-outline"
              @click="cambiarEstadoCampana('pausar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Pausar' }}
            </button>
            <button
              v-if="campanaSeleccionada.estado === 'pausada'"
              class="btn-primary"
              @click="cambiarEstadoCampana('activar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Reactivar' }}
            </button>
            <button
              v-if="campanaSeleccionada.estado === 'activa' || campanaSeleccionada.estado === 'pausada'"
              class="btn-danger"
              @click="cambiarEstadoCampana('finalizar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Finalizar' }}
            </button>
            <button class="btn-outline" @click="abrirModalCampana(campanaSeleccionada)">Editar campaña</button>
            <button
              v-if="campanaSeleccionada.estado === 'borrador'"
              class="btn-danger"
              @click="abrirModalEliminar(campanaSeleccionada)"
              :disabled="guardando"
            >
              Eliminar
            </button>
            <button class="btn-primary" @click="abrirModalKit()">+ Nuevo Kit</button>
          </div>
        </div>

        <div class="table-area" style="margin-top:0">
          <div class="table-toolbar">
            <h3 style="font-size:15px;font-weight:700;color:#1a1a1a;margin:0">
              Kits de esta campaña
              <span style="font-size:12px;color:#999;font-weight:400;margin-left:8px">{{ kits.length }} kits</span>
            </h3>
          </div>

          <div v-if="cargandoKits" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando kits...</span>
          </div>

          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kit</th>
                  <th>Precio</th>
                  <th>Stock Central</th>
                  <th>Reservado</th>
                  <th>Disp. Central</th>
                  <th>En Red</th>
                  <th>Vendidos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="kits.length === 0">
                  <td colspan="9" class="empty-state">No hay kits en esta campaña. ¡Crea el primero!</td>
                </tr>
                <tr v-for="k in kits" :key="k.id">
                  <td>
                    <div class="camp-name">{{ k.nombre }}</div>
                    <div class="camp-desc">{{ k.descripcion ?? '—' }}</div>
                  </td>
                  <td class="td-center">{{ formatCurrency(k.precio_unitario) }}</td>
                  <td class="td-center">{{ k.stock_central }}</td>
                  <td class="td-center">{{ k.stock_comprometido }}</td>
                  <td class="td-center">
                    <span :class="stockCentralDisponible(k) > 0 ? 'stock-ok' : 'stock-agotado'">
                      {{ stockCentralDisponible(k) }}
                    </span>
                  </td>
                  <td class="td-center">{{ stockEnRed(k) }}</td>
                  <td class="td-center">{{ stockVendido(k) }}</td>
                  <td>
                    <span class="badge" :class="k.activo ? 'estado-activa' : 'estado-borrador'">
                      {{ k.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="td-actions">
                    <button class="btn-action" @click="verDetalleKit(k)">Ver detalle</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    <!-- ── Modal Crear/Editar Campaña ── -->
    <div v-if="modalCampana" class="modal-overlay modal-overlay--campaign" @click.self="modalCampana = false">
      <div class="modal modal-campaign" role="dialog" aria-modal="true" aria-labelledby="campaign-modal-title">
        <div class="modal-header">
          <div class="modal-header__content">
            <h2 id="campaign-modal-title">{{ modoEdicion ? 'Editar Campaña' : 'Nueva Campaña' }}</h2>
            <div v-if="campaignFormError" class="campaign-form-alert" role="alert">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <span>{{ campaignFormError }}</span>
            </div>
          </div>
          <button type="button" class="modal-close" aria-label="Cerrar" @click="modalCampana = false">✕</button>
        </div>
        <div class="modal-body campaign-modal-body">
          <section class="campaign-image-section" aria-labelledby="campaign-image-title">
            <div class="campaign-section-heading">
              <h3 id="campaign-image-title">Imagen de la campaña</h3>
              <span class="campaign-image-ratio">Recomendado: 16:9</span>
            </div>
            <input
              ref="campaignImageInput"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              class="visually-hidden"
              aria-label="Elegir imagen de campaña"
              @change="seleccionarImagenCampana"
            />
            <div
              v-if="imagenCampanaPreview"
              class="campaign-image-preview"
              @dragover.prevent
              @drop.prevent="soltarImagenCampana"
            >
              <img
                v-if="!imagenFallida(imagenCampanaPreview)"
                :src="imagenCampanaPreview"
                alt="Vista previa de la imagen de campaña"
                loading="lazy"
                @error="marcarImagenFallida(imagenCampanaPreview)"
              />
              <span v-else class="campaign-image-placeholder" aria-hidden="true">Imagen no disponible</span>
              <div class="campaign-image-controls">
                <button type="button" class="btn-secondary" @click="elegirImagenCampana">Cambiar</button>
                <button
                  type="button"
                  class="btn-secondary"
                  :disabled="!imagenCampanaSeleccionada"
                  :title="imagenCampanaSeleccionada ? 'Quitar la imagen seleccionada' : 'Quitar una imagen existente estará disponible próximamente'"
                  @click="quitarImagenCampana"
                >
                  Quitar
                </button>
              </div>
            </div>
            <button
              v-else
              type="button"
              class="campaign-image-dropzone"
              @click="elegirImagenCampana"
              @dragover.prevent
              @drop.prevent="soltarImagenCampana"
            >
              <span class="campaign-image-placeholder" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7">
                  <path d="M12 16V4m-4 4 4-4 4 4" />
                  <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
                </svg>
              </span>
              <strong>Arrastra una imagen o elige un archivo</strong>
              <span>JPG, PNG o WebP · máximo 5 MB</span>
            </button>
            <p v-if="errorImagenCampana" class="form-error" role="alert">{{ errorImagenCampana }}</p>
            <div class="campaign-image-upload-status">
              <span>{{ imagenCampanaSeleccionada ? 'La imagen se subirá automáticamente después de guardar la campaña.' : 'La imagen puede cambiarse cuando quieras.' }}</span>
              <button
                v-if="imagenCampanaPendienteId && imagenCampanaSeleccionada"
                type="button"
                class="btn-outline"
                :disabled="subiendoImagenCampana"
                @click="reintentarSubidaImagenCampana"
              >
                {{ subiendoImagenCampana ? 'Subiendo...' : 'Reintentar subida' }}
              </button>
            </div>
            <p v-if="errorSubidaImagenCampana" class="form-error" role="alert">{{ errorSubidaImagenCampana }}</p>
          </section>

          <div v-if="!modoEdicion" class="campaign-draft-note">
            <span class="badge estado-borrador">Borrador</span>
            <span>Se crea en borrador. Podrás activarla cuando tenga al menos un kit activo</span>
          </div>
          <div v-else class="campaign-current-state">
            <span class="form-label">Estado actual</span>
            <span class="badge" :class="`estado-${formCampana.estado}`">
              {{ opcionesEstado.find((op) => op.value === formCampana.estado)?.label ?? formCampana.estado }}
            </span>
          </div>
          <div class="form-group">
            <label>Nombre *</label>
            <input
              id="campaign-name"
              v-model="formCampana.nombre"
              type="text"
              maxlength="100"
              autocomplete="off"
              placeholder="Nombre de la campaña"
              class="form-input"
              :aria-invalid="Boolean(formErrors.nombre)"
              @input="handleCampaignNameInput($event); limpiarErrorCampo('nombre')"
            />
            <span v-if="formErrors.nombre" class="form-error">{{ formErrors.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea
              id="campaign-description"
              v-model="formCampana.descripcion"
              placeholder="Descripción opcional"
              class="form-input form-textarea"
              @input="limpiarErrorCampo('descripcion')"
            ></textarea>
          </div>
          <div class="form-row campaign-date-row">
            <div class="form-group">
              <DatePicker
                id="campaign-start-date"
                :model-value="formCampana.fecha_inicio"
                @update:model-value="actualizarFechaCampana('fecha_inicio', $event)"
                label="Fecha Inicio"
                :invalid="Boolean(formErrors.fecha_inicio || formErrors.fecha_rango)"
                :error-message="formErrors.fecha_inicio"
                :range-start="formCampana.fecha_inicio"
                :range-end="formCampana.fecha_fin"
              />
            </div>
            <div class="form-group">
              <DatePicker
                id="campaign-end-date"
                :model-value="formCampana.fecha_fin"
                @update:model-value="actualizarFechaCampana('fecha_fin', $event)"
                label="Fecha Fin"
                :min="formCampana.fecha_inicio"
                :invalid="Boolean(formErrors.fecha_fin || formErrors.fecha_rango)"
                :error-message="formErrors.fecha_fin"
                :range-start="formCampana.fecha_inicio"
                :range-end="formCampana.fecha_fin"
              />
            </div>
          </div>
          <span v-if="formErrors.fecha_rango" class="form-error campaign-date-error">
            {{ formErrors.fecha_rango }}
          </span>
          <section v-if="modoEdicion" class="campaign-kits-section">
            <div class="campaign-section-heading">
              <h3>Kits de la campaña</h3>
              <button type="button" class="btn-outline" @click="crearKitDesdeModalCampana">Agregar kit</button>
            </div>
            <div v-if="cargandoKitsModal" class="campaign-kit-modal-skeleton" aria-label="Cargando kits" aria-busy="true">
              <span v-for="index in 2" :key="index"></span>
            </div>
            <div v-else-if="errorKitsModal" class="campaign-load-error" role="alert">
              <p>{{ errorKitsModal }}</p>
              <button type="button" class="btn-outline" @click="cargarKitsModal(campanaEditando)">Reintentar</button>
            </div>
            <div v-else-if="kitsCampanaModal.length" class="campaign-kit-modal-list">
              <article v-for="kit in kitsCampanaModal" :key="kit.id" class="campaign-kit-modal-item">
                <span class="campaign-kit-modal-image">
                  <img
                    v-if="kit.imagen_url && !imagenFallida(kit.imagen_url)"
                    :src="kit.imagen_url"
                    :alt="`Imagen de ${kit.nombre}`"
                    loading="lazy"
                    @error="marcarImagenFallida(kit.imagen_url)"
                  />
                  <span v-else class="campaign-image-placeholder" aria-hidden="true">▧</span>
                </span>
                <span class="campaign-kit-modal-name">{{ kit.nombre }}</span>
                <span class="badge" :class="kit.activo ? 'estado-activa' : 'estado-borrador'">
                  {{ kit.activo ? 'Activo' : 'Inactivo' }}
                </span>
                <span class="campaign-kit-modal-quantity">{{ kit.stock_central ?? 0 }} unidades</span>
              </article>
            </div>
            <p v-else class="campaign-catalog-empty">Esta campaña aún no tiene kits</p>
          </section>
          <p v-else class="campaign-draft-note">
            Podrás agregar kits después de crear la campaña
          </p>
        </div>
        <div class="modal-footer campaign-modal-footer">
          <button type="button" class="btn-secondary" @click="modalCampana = false">Cancelar</button>
          <button type="button" class="btn-primary" @click="guardarCampana" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal Crear Kit ── -->
    <div v-if="modalKit" class="modal-overlay" @click.self="cerrarModalKit">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>{{ modoEdicionKit ? 'Editar Kit' : 'Nuevo Kit' }}</h2>
          <button class="modal-close" aria-label="Cerrar" @click="cerrarModalKit">✕</button>
        </div>
        <div class="modal-body">
          <section class="kit-editor-section" aria-labelledby="kit-photos-title">
            <div class="kit-editor-section-heading">
              <div>
                <h3 id="kit-photos-title">Fotos del kit</h3>
                <p class="form-help">Hasta 6 fotos JPG, PNG o WebP; máximo 5 MB cada una.</p>
              </div>
              <span class="kit-photo-count">{{ kitFotos.length }}/6</span>
            </div>
            <input
              ref="kitPhotoInput"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              class="visually-hidden"
              aria-label="Elegir fotos del kit"
              @change="seleccionarFotosKit"
            />
            <div
              class="kit-photo-dropzone"
              @dragover.prevent
              @drop.prevent="soltarFotosKit"
            >
              <span>Arrastra fotos aquí o selecciona archivos ({{ kitFotos.length }}/6)</span>
              <button type="button" class="btn-outline" :disabled="kitFotos.length >= 6" @click="elegirFotosKit">
                Elegir fotos
              </button>
            </div>
            <p v-if="kitPhotoError" class="form-error" role="alert">{{ kitPhotoError }}</p>
            <div v-if="kitFotos.length" class="kit-photo-grid">
              <article v-for="(foto, index) in kitFotos" :key="foto.id" class="kit-photo-card">
                <img v-if="!imagenFallida(foto.preview)" :src="foto.preview" :alt="`Foto ${index + 1} del kit`" loading="lazy" @error="marcarImagenFallida(foto.preview)" />
                <span v-else class="campaign-image-placeholder">Imagen no disponible</span>
                <span v-if="foto.portada" class="kit-photo-cover-badge">Portada</span>
                <div class="kit-photo-actions">
                  <button type="button" class="btn-action" :disabled="foto.portada" @click="marcarFotoPortada(index)">Marcar portada</button>
                  <button type="button" class="btn-action" :disabled="index === 0" aria-label="Mover foto antes" @click="moverFotoKit(index, -1)">↑</button>
                  <button type="button" class="btn-action" :disabled="index === kitFotos.length - 1" aria-label="Mover foto después" @click="moverFotoKit(index, 1)">↓</button>
                  <button type="button" class="btn-remove" :aria-label="`Quitar foto ${index + 1}`" @click="quitarFotoKit(index)">✕</button>
                </div>
              </article>
            </div>
            <div class="kit-photo-upload-status">
              <span>Las fotos se pueden organizar aquí; aún no se guardan en el servidor.</span>
              <button type="button" class="btn-outline" disabled aria-disabled="true">Subir fotos · Disponible próximamente</button>
            </div>
          </section>

          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="formKit.nombre" type="text" maxlength="100" autocomplete="off" placeholder="Nombre del kit" class="form-input" @input="handleKitNameInput" />
            <span v-if="kitErrors.nombre" class="form-error">{{ kitErrors.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formKit.descripcion" placeholder="Descripción opcional" class="form-input form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio por kit ({{ currencyCode }}) *</label>
              <span class="form-help">Monto de venta de un kit completo, no de cada producto individual.</span>
              <input v-model="formKit.precio_unitario" type="text" inputmode="decimal" maxlength="12" autocomplete="off" placeholder="0.00" class="form-input" @input="handleKitPriceInput" />
              <span v-if="kitErrors.precio_unitario" class="form-error">{{ kitErrors.precio_unitario }}</span>
            </div>
            <div class="form-group">
              <label>Kits disponibles al inicio *</label>
              <span class="form-help">Cantidad de kits completos que tendras listos para distribuir.</span>
              <input v-model="formKit.stock_central" type="text" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="0" class="form-input" @input="handleKitIntegerInput('stock_central', null, $event)" />
              <span v-if="kitErrors.stock_central" class="form-error">{{ kitErrors.stock_central }}</span>
            </div>
          </div>
          <section class="kit-editor-section" aria-labelledby="kit-products-title">
            <div class="kit-editor-section-heading">
              <div>
                <h3 id="kit-products-title">Productos del kit</h3>
                <p class="form-help">Indica cuántas unidades incluye un kit y añade una descripción de hasta 500 caracteres.</p>
              </div>
              <button type="button" class="btn-outline" @click="agregarProducto">+ Agregar producto</button>
            </div>
            <div class="kit-products-table-wrap">
              <table class="kit-products-table">
                <thead>
                  <tr><th>Imagen</th><th>Nombre</th><th>Descripción</th><th>Cantidad</th><th>Orden</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="(prod, i) in formKit.productos" :key="prod.localId">
                    <td data-label="Imagen">
                      <div class="kit-product-image-control">
                        <span class="kit-product-image">
                          <img v-if="prod.imagen_url && !imagenFallida(prod.imagen_url)" :src="prod.imagen_url" :alt="`Imagen de ${prod.nombre || 'producto'}`" loading="lazy" @error="marcarImagenFallida(prod.imagen_url)" />
                          <span v-else class="campaign-image-placeholder" aria-hidden="true">▧</span>
                        </span>
                        <button type="button" class="btn-action" disabled aria-disabled="true">Subir · Disponible próximamente</button>
                      </div>
                    </td>
                    <td data-label="Nombre">
                      <input v-model="prod.nombre" type="text" maxlength="100" autocomplete="off" placeholder="Nombre del producto" class="form-input" :aria-invalid="Boolean(productCellErrors[`${i}.nombre`])" @input="handleProductNameInput(i, $event); limpiarErrorProducto(i, 'nombre')" />
                      <span v-if="productCellErrors[`${i}.nombre`]" class="form-error">{{ productCellErrors[`${i}.nombre`] }}</span>
                    </td>
                    <td data-label="Descripción">
                      <textarea v-model="prod.descripcion" maxlength="500" placeholder="Descripción breve del producto" class="form-input kit-product-description" :aria-invalid="Boolean(productCellErrors[`${i}.descripcion`])" @input="limpiarErrorProducto(i, 'descripcion')"></textarea>
                      <span class="kit-description-count">{{ prod.descripcion.length }}/500</span>
                      <span v-if="productCellErrors[`${i}.descripcion`]" class="form-error">{{ productCellErrors[`${i}.descripcion`] }}</span>
                    </td>
                    <td data-label="Cantidad">
                      <input v-model.number="prod.cantidad" type="text" inputmode="numeric" maxlength="6" placeholder="Unid./kit" aria-label="Unidades por kit" class="form-input form-input-sm" :aria-invalid="Boolean(productCellErrors[`${i}.cantidad`])" @input="handleKitIntegerInput('cantidad', i, $event); limpiarErrorProducto(i, 'cantidad')" />
                      <span v-if="productCellErrors[`${i}.cantidad`]" class="form-error">{{ productCellErrors[`${i}.cantidad`] }}</span>
                    </td>
                    <td data-label="Orden">
                      <div class="kit-product-row-actions">
                        <button type="button" class="btn-action" :disabled="i === 0" aria-label="Mover producto antes" @click="moverProducto(i, -1)">↑</button>
                        <button type="button" class="btn-action" :disabled="i === formKit.productos.length - 1" aria-label="Mover producto después" @click="moverProducto(i, 1)">↓</button>
                      </div>
                    </td>
                    <td>
                      <button type="button" class="btn-remove" :aria-label="`Quitar producto ${prod.nombre || i + 1}`" @click="eliminarProducto(i)">✕</button>
                    </td>
                  </tr>
                  <tr v-if="formKit.productos.length === 0">
                    <td colspan="6" class="empty-state">Agrega productos a este kit.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <span v-if="kitErrors.contenido_detalle" class="form-error">{{ kitErrors.contenido_detalle }}</span>
          </section>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cerrarModalKit">Cancelar</button>
          <button class="btn-primary" @click="guardarKit" :disabled="guardando || !kitFormValid">
            {{ guardando ? 'Guardando...' : (modoEdicionKit ? 'Actualizar Kit' : 'Crear Kit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal Detalle Kit ── -->
    <div v-if="modalContenido" class="modal-overlay" @click.self="modalContenido = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>Detalle del kit</h2>
          <button class="modal-close" @click="modalContenido = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="kit-detail-header">
            <div>
              <div class="camp-name">{{ kitDetalle?.nombre }}</div>
              <div class="camp-desc">{{ kitDetalle?.descripcion ?? 'Sin descripción' }}</div>
            </div>
            <span class="badge" :class="kitDetalle?.activo ? 'estado-activa' : 'estado-borrador'">
              {{ kitDetalle?.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="kit-detail-grid">
            <div class="kit-detail-card">
              <span class="kit-detail-label">Precio por kit</span>
              <strong>{{ formatCurrency(kitDetalle?.precio_unitario ?? 0) }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Stock central</span>
              <strong>{{ kitDetalle?.stock_central ?? 0 }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Reservado central</span>
              <strong>{{ kitDetalle?.stock_comprometido ?? 0 }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Disponible central</span>
              <strong :class="stockCentralDisponible(kitDetalle) > 0 ? 'stock-ok' : 'stock-agotado'">
                {{ stockCentralDisponible(kitDetalle) }}
              </strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Stock en red</span>
              <strong>{{ stockEnRed(kitDetalle) }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Vendidos</span>
              <strong>{{ stockVendido(kitDetalle) }}</strong>
            </div>
          </div>

          <div>
            <div class="section-title">Contenido del kit</div>
            <table class="data-table">
              <thead><tr><th>Imagen</th><th>Producto</th><th>Descripción</th><th>Unidades por kit</th></tr></thead>
              <tbody>
                <tr v-if="detalleProductos.length === 0">
                  <td colspan="4" class="empty-state">No hay productos configurados para este kit.</td>
                </tr>
                <tr v-for="(p, i) in detalleProductos" :key="i">
                  <td>
                    <span class="kit-product-image">
                      <img v-if="p.imagen_url && !imagenFallida(p.imagen_url)" :src="p.imagen_url" :alt="`Imagen de ${p.nombre}`" loading="lazy" @error="marcarImagenFallida(p.imagen_url)" />
                      <span v-else class="campaign-image-placeholder" aria-hidden="true">▧</span>
                    </span>
                  </td>
                  <td>{{ p.nombre }}</td>
                  <td>{{ p.descripcion || '—' }}</td>
                  <td class="td-center">{{ p.cantidad }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="editarKitDesdeDetalle" :disabled="guardando">Editar</button>
          <button class="btn-danger" @click="toggleKitActivo(kitDetalle)" :disabled="guardando">
            {{ guardando ? 'Procesando...' : (kitDetalle?.activo ? 'Desactivar' : 'Activar') }}
          </button>
          <button class="btn-secondary" @click="modalContenido = false">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ── Modal Confirmar Eliminar ── -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Eliminar Campaña</h2>
          <button class="modal-close" @click="modalEliminar = false">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar <strong>{{ campanaAEliminar?.nombre }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
          <button class="btn-danger" @click="eliminarCampana" :disabled="guardando">
            {{ guardando ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { API_BASE_URL } from '@/app/apiClient'
import AppShell from '../../components/layout/AppShell.vue'
import DatePicker from '../../components/shared/DatePicker.vue'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'
import { useWorkspaceCurrency } from '../../composables/useWorkspaceCurrency'
import {
  isValidIntegerInRange,
  isValidPositiveDecimal,
  sanitizeDecimal,
  sanitizeInteger,
  sanitizeText,
} from '@/utils/fieldRules'

const API_BASE = API_BASE_URL
const { authHeaders, logout: cerrarSesion } = useAuthenticatedSession()
const { currencyCode, ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()

const hdrs = () => authHeaders({ 'Content-Type': 'application/json' })

type KitProductField = 'nombre' | 'descripcion' | 'cantidad'
interface KitProductForm {
  localId: number
  nombre: string
  descripcion: string
  cantidad: number
  imagen_url: string
  preservedFields: Record<string, unknown>
}
interface KitPhotoDraft {
  id: number
  file: File | null
  preview: string
  portada: boolean
}

// ── Campañas state ──
const campanas     = ref<any[]>([])
const cargando     = ref(false)
const guardando    = ref(false)
const errorMsg     = ref('')
const campaignListError = ref('')
const successMsg   = ref('')
const busqueda     = ref('')
const filtroEstado = ref('todos')
const fechaInicio  = ref('')
const fechaFin     = ref('')
const meta         = ref({ total: 0, current_page: 1, last_page: 1 })
// kits metadata por campaña: { [campanaId]: { total, stockInicial, comprometido, progreso } }
const kitsMeta     = ref<Record<number, any>>({})

const modalCampana     = ref(false)
const modoEdicion      = ref(false)
const campanaEditando  = ref<any>(null)
const modalEliminar    = ref(false)
const campanaAEliminar = ref<any>(null)
const formErrors       = ref<Record<string, string>>({})
const campaignFormError = ref('')
const formCampana      = ref({ nombre: '', descripcion: '', estado: 'borrador', fecha_inicio: '', fecha_fin: '' })
const campaignImageInput = ref<HTMLInputElement | null>(null)
const imagenCampanaSeleccionada = ref<File | null>(null)
const imagenCampanaActual = ref('')
const imagenCampanaPreviewTemporal = ref('')
const errorImagenCampana = ref('')
const imagenCampanaPreview = computed(() => imagenCampanaPreviewTemporal.value || imagenCampanaActual.value)
const imagenCampanaPendienteId = ref<number | null>(null)
const subiendoImagenCampana = ref(false)
const errorSubidaImagenCampana = ref('')
const imagenCampanaPendienteEsCreacion = ref(false)
const campanaExpandidaId = ref<number | null>(null)
const catalogosKits = ref<Record<number, any[]>>({})
const catalogosEstado = ref<Record<number, 'idle' | 'loading' | 'loaded' | 'error'>>({})
const erroresCatalogo = ref<Record<number, string>>({})
const imagenesFallidas = ref<Record<string, boolean>>({})
const kitsCampanaModal = ref<any[]>([])
const cargandoKitsModal = ref(false)
const errorKitsModal = ref('')
const campanaKitTarget = ref<any>(null)
const handleCampaignNameInput = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const value = sanitizeText(event.target.value, 100)
  event.target.value = value
  formCampana.value.nombre = value
}
const handleKitNameInput = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const value = sanitizeText(event.target.value, 100)
  event.target.value = value
  formKit.value.nombre = value
}
const kitProductId = { value: 0 }
const createKitProduct = (product: Partial<KitProductForm> = {}): KitProductForm => ({
  localId: ++kitProductId.value,
  nombre: product.nombre ?? '',
  descripcion: product.descripcion ?? '',
  cantidad: Number(product.cantidad ?? 1),
  imagen_url: product.imagen_url ?? '',
  preservedFields: product.preservedFields ?? {},
})
const handleProductNameInput = (index: number, event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const value = sanitizeText(event.target.value, 100)
  event.target.value = value
  const product = formKit.value.productos[index]
  if (product) product.nombre = value
}
const handleKitPriceInput = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const value = sanitizeDecimal(event.target.value)
  event.target.value = value
  formKit.value.precio_unitario = value
}
const handleKitIntegerInput = (field: 'stock_central' | 'cantidad', index: number | null, event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const value = sanitizeInteger(event.target.value)
  event.target.value = value
  if (field === 'stock_central') {
    formKit.value.stock_central = value
  } else if (index !== null && formKit.value.productos[index]) {
    formKit.value.productos[index]!.cantidad = Number(value) || 0
  }
}

const limpiarErrorProducto = (index: number, field: KitProductField) => {
  delete productCellErrors.value[`${index}.${field}`]
}

watch(fechaInicio, (inicio) => {
  if (inicio && fechaFin.value && fechaFin.value < inicio) {
    fechaFin.value = ''
  }
})

const actualizarFechaCampana = (campo: 'fecha_inicio' | 'fecha_fin', fecha: string) => {
  formCampana.value[campo] = fecha
  delete formErrors.value[campo]
  delete formErrors.value.fecha_rango
  campaignFormError.value = ''
}

const limpiarErrorCampo = (campo: string) => {
  delete formErrors.value[campo]
  if (campo === 'fecha_inicio' || campo === 'fecha_fin') delete formErrors.value.fecha_rango
  campaignFormError.value = ''
}

const getCampaignErrorText = (errors: Record<string, unknown>) =>
  Object.values(errors)
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter((value): value is string => typeof value === 'string')
    .join(' ')

const getConflictingCampaignName = (message: string) => {
  const patterns = [
    /(?:cruz|superpuest|solap).{0,100}?(?:campaña\s+)?["'“]([^"'”]+)["'”]/i,
    /campaña(?:\s+existente)?\s*[:\-]\s*["'“]([^"'”]+)["'”]/i,
    /campaña(?:\s+existente)?\s*[:\-]\s*([^.;]+)/i,
    /(?:con|contra)\s+(?:la\s+)?campaña\s+["'“]([^"'”]+)["'”]/i,
    /campaña\s+(?:llamada|denominada)\s+([^.;]+)/i,
  ]
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return ''
}

const getDateOverlapMessage = (message: string) => {
  const campaignName = getConflictingCampaignName(message)
  return campaignName
    ? `Las fechas se cruzan con otra campaña existente. Elige otro rango (Campaña: ${campaignName})`
    : 'Las fechas se cruzan con otra campaña existente. Elige otro rango'
}

const focusCampaignError = async (fields: string[]) => {
  const fieldIds: Record<string, string> = {
    nombre: 'campaign-name',
    descripcion: 'campaign-description',
    fecha_inicio: 'campaign-start-date',
    fecha_fin: 'campaign-end-date',
    fecha_rango: 'campaign-start-date',
  }
  const field = ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'fecha_rango']
    .find((key) => fields.includes(key))
  await nextTick()
  document.getElementById((field ? fieldIds[field] : undefined) ?? 'campaign-name')?.focus()
}

// ── Kits state ──
const campanaSeleccionada = ref<any>(null)
const kits                = ref<any[]>([])
const cargandoKits        = ref(false)
const modalKit            = ref(false)
const modoEdicionKit      = ref(false)
const kitEditando         = ref<any>(null)
const kitErrors           = ref<Record<string, string>>({})
const modalContenido      = ref(false)
const kitDetalle          = ref<any>(null)
const crearFormKitVacio   = () => ({ nombre: '', descripcion: '', precio_unitario: '', stock_central: '', productos: [createKitProduct()] })
const formKit             = ref(crearFormKitVacio())
const contenidoDetalleExtra = ref<Record<string, unknown>>({})
const productCellErrors = ref<Record<string, string>>({})
const kitPhotoInput = ref<HTMLInputElement | null>(null)
const kitFotos = ref<KitPhotoDraft[]>([])
const kitPhotoError = ref('')
const kitPhotosModified = ref(false)
const kitFormValid = computed(() => (
  Boolean(formKit.value.nombre.trim())
  && formKit.value.nombre.length <= 100
  && isValidPositiveDecimal(formKit.value.precio_unitario)
  && isValidIntegerInRange(formKit.value.stock_central, 0, 100000)
  && formKit.value.productos.some((product) => product.nombre.trim())
  && formKit.value.productos.every((product) =>
    !product.nombre.trim()
      ? !product.descripcion.trim() && !product.imagen_url
      : (
      product.nombre.length <= 100
      && product.descripcion.length <= 500
      && isValidIntegerInRange(String(product.cantidad), 1, 100000)
    ),
  )
))
let kitPhotoId = 0

const limpiarFotosKit = () => {
  kitFotos.value.forEach((photo) => {
    if (photo.file) URL.revokeObjectURL(photo.preview)
  })
  kitFotos.value = []
  kitPhotoError.value = ''
  kitPhotosModified.value = false
  if (kitPhotoInput.value) kitPhotoInput.value.value = ''
}

const addKitPhotos = (files: FileList | File[]) => {
  kitPhotoError.value = ''
  const candidates = Array.from(files)
  if (!candidates.length) return
  if (kitFotos.value.length + candidates.length > 6) {
    kitPhotoError.value = 'Puedes agregar hasta 6 fotos por kit.'
    return
  }
  for (const file of candidates) {
    const validExtension = /\.(jpe?g|png|webp)$/i.test(file.name)
    const validMime = !file.type || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    if (!validExtension || !validMime) {
      kitPhotoError.value = 'Cada foto debe ser JPG, PNG o WebP.'
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      kitPhotoError.value = 'Cada foto debe pesar 5 MB o menos.'
      return
    }
  }
  for (const file of candidates) {
    kitFotos.value.push({
      id: ++kitPhotoId,
      file,
      preview: URL.createObjectURL(file),
      portada: kitFotos.value.length === 0,
    })
  }
  kitPhotosModified.value = true
}

const elegirFotosKit = () => kitPhotoInput.value?.click()
const seleccionarFotosKit = (event: Event) => {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  addKitPhotos(input.files ?? [])
  input.value = ''
}
const soltarFotosKit = (event: DragEvent) => {
  if (event.dataTransfer?.files) addKitPhotos(event.dataTransfer.files)
}
const marcarFotoPortada = (index: number) => {
  kitFotos.value = kitFotos.value.map((photo, photoIndex) => ({ ...photo, portada: photoIndex === index }))
  kitPhotosModified.value = true
}
const moverFotoKit = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= kitFotos.value.length) return
  const reordered = [...kitFotos.value]
  ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex]!, reordered[index]!]
  kitFotos.value = reordered
  kitPhotosModified.value = true
}
const quitarFotoKit = (index: number) => {
  const [removed] = kitFotos.value.splice(index, 1)
  if (removed?.file) URL.revokeObjectURL(removed.preview)
  if (removed?.portada && kitFotos.value.length) marcarFotoPortada(0)
  kitPhotosModified.value = true
}
const cerrarModalKit = () => {
  modalKit.value = false
  limpiarFotosKit()
  productCellErrors.value = {}
}

const imagenFallida = (url: string) => Boolean(imagenesFallidas.value[url])
const marcarImagenFallida = (url: string) => { imagenesFallidas.value[url] = true }

const liberarPreviewImagenCampana = () => {
  if (!imagenCampanaPreviewTemporal.value) return
  URL.revokeObjectURL(imagenCampanaPreviewTemporal.value)
  imagenCampanaPreviewTemporal.value = ''
}

const limpiarSeleccionImagenCampana = () => {
  liberarPreviewImagenCampana()
  imagenCampanaSeleccionada.value = null
  if (campaignImageInput.value) campaignImageInput.value.value = ''
}

const elegirImagenCampana = () => campaignImageInput.value?.click()

const validarImagenCampana = (file: File) => {
  const extensionValida = /\.(jpe?g|png|webp)$/i.test(file.name)
  const tipoValido = !file.type || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  if (!extensionValida || !tipoValido) return 'Elige una imagen JPG, PNG o WebP.'
  if (file.size > 5 * 1024 * 1024) return 'La imagen no puede superar 5 MB.'
  return ''
}

const establecerImagenCampana = (file?: File) => {
  errorImagenCampana.value = ''
  if (!file) return
  const validationError = validarImagenCampana(file)
  if (validationError) {
    limpiarSeleccionImagenCampana()
    errorImagenCampana.value = validationError
    return
  }
  limpiarSeleccionImagenCampana()
  imagenCampanaSeleccionada.value = file
  imagenCampanaPreviewTemporal.value = URL.createObjectURL(file)
  imagenCampanaPendienteId.value = null
  errorSubidaImagenCampana.value = ''
}

const seleccionarImagenCampana = (event: Event) => {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  establecerImagenCampana(input.files?.[0])
}

const soltarImagenCampana = (event: DragEvent) => {
  establecerImagenCampana(event.dataTransfer?.files[0])
}

const quitarImagenCampana = () => {
  if (imagenCampanaSeleccionada.value) limpiarSeleccionImagenCampana()
}

onBeforeUnmount(() => {
  liberarPreviewImagenCampana()
  limpiarFotosKit()
})

const opcionesEstado = [
  { value: 'todos',      label: 'Todos',      color: '#4ab8f5' },
  { value: 'activa',     label: 'Activa',     color: '#22c55e' },
  { value: 'pausada',    label: 'Pausada',    color: '#f59e0b' },
  { value: 'borrador',   label: 'Borrador',   color: '#94a3b8' },
  { value: 'finalizada', label: 'Finalizada', color: '#6366f1' },
]

const formatFecha = (f: string | null) => {
  if (!f) return '—'
  const fecha = new Date(f)
  return isNaN(fecha.getTime()) ? '—' : fecha.toLocaleDateString('es-PE')
}
const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const fecha = new Date(value)
  return isNaN(fecha.getTime()) ? '' : fecha.toISOString().slice(0, 10)
}
const limpiarMensajes = () => {
  errorMsg.value = ''
  successMsg.value = ''
}
const contarEstado    = (e: string) => campanas.value.filter(c => c.estado === e).length
const toNumber = (value: unknown) => Number(value ?? 0)
const stockCentralDisponible = (k: any) => toNumber(k?.stock_central_disponible ?? (toNumber(k?.stock_central) - toNumber(k?.stock_comprometido)))
const stockEnRed = (k: any) => toNumber(k?.stock_distribuido_disponible) + toNumber(k?.stock_distribuido_comprometido)
const stockVendido = (k: any) => toNumber(k?.stock_distribuido_vendido)
const stockMovidoRed = (k: any) => toNumber(k?.stock_distribuido_total ?? (stockEnRed(k) + stockVendido(k)))
const totalKitsDefinidos = computed(() => Object.values(kitsMeta.value).reduce((a: number, m: any) => a + (m.total ?? 0), 0))
const normalizarProductosKit = (contenidoDetalle: any) => {
  const productos = contenidoDetalle?.productos

  if (Array.isArray(productos)) {
    return productos.map((producto: any) => {
      if (typeof producto === 'string') {
        return createKitProduct({ nombre: producto, cantidad: 1 })
      }

      const {
        nombre,
        cantidad,
        descripcion,
        imagen_url,
        ...preservedFields
      } = producto ?? {}
      return createKitProduct({
        nombre: nombre ?? 'Producto sin nombre',
        cantidad: Number(cantidad ?? 1),
        descripcion: typeof descripcion === 'string' ? descripcion : '',
        imagen_url: typeof imagen_url === 'string' ? imagen_url : '',
        preservedFields,
      })
    })
  }

  if (productos && typeof productos === 'object') {
    return Object.entries(productos).map(([nombre, detail]) => {
      if (detail && typeof detail === 'object') {
        const {
          nombre: productName,
          cantidad,
          descripcion,
          imagen_url,
          ...preservedFields
        } = detail as Record<string, unknown>
        return createKitProduct({
          nombre: typeof productName === 'string' ? productName : nombre,
          cantidad: Number(cantidad ?? 1),
          descripcion: typeof descripcion === 'string' ? descripcion : '',
          imagen_url: typeof imagen_url === 'string' ? imagen_url : '',
          preservedFields,
        })
      }
      return createKitProduct({ nombre, cantidad: Number(detail ?? 1) })
    })
  }

  return []
}

const detalleProductos = computed(() => {
  return normalizarProductosKit(kitDetalle.value?.contenido_detalle)
})

const campanasFiltradas = computed(() =>
  campanas.value.filter(c => {
    const matchEstado   = filtroEstado.value === 'todos' || c.estado === filtroEstado.value
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
    const campaignStart = c.fecha_inicio ? new Date(`${c.fecha_inicio}T00:00:00`) : null
    const campaignEnd = c.fecha_fin ? new Date(`${c.fecha_fin}T23:59:59`) : campaignStart
    const fromDate = fechaInicio.value ? new Date(`${fechaInicio.value}T00:00:00`) : null
    const toDate = fechaFin.value ? new Date(`${fechaFin.value}T23:59:59`) : null
    const matchDesde = !fromDate || !campaignEnd || campaignEnd >= fromDate
    const matchHasta = !toDate || !campaignStart || campaignStart <= toDate
    return matchEstado && matchBusqueda && matchDesde && matchHasta
  })
)

const extraerKits = (json: any): any[] => {
  const data = json?.data
  const lista = data?.data ?? data?.kits ?? data
  return Array.isArray(lista) ? lista : []
}

const cargarCatalogoCampana = async (campanaId: number) => {
  catalogosEstado.value[campanaId] = 'loading'
  erroresCatalogo.value[campanaId] = ''
  try {
    const res = await fetch(`${API_BASE}/workspace/admin/kits?campana_id=${campanaId}`, { headers: hdrsGet() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      catalogosKits.value[campanaId] = extraerKits(json)
      catalogosEstado.value[campanaId] = 'loaded'
    } else {
      erroresCatalogo.value[campanaId] = json.message ?? 'No se pudo cargar el catálogo de esta campaña.'
      catalogosEstado.value[campanaId] = 'error'
    }
  } catch {
    erroresCatalogo.value[campanaId] = 'No se pudo conectar. Inténtalo de nuevo.'
    catalogosEstado.value[campanaId] = 'error'
  }
}

const toggleCatalogoCampana = (campana: any) => {
  if (campanaExpandidaId.value === campana.id) {
    campanaExpandidaId.value = null
    return
  }
  campanaExpandidaId.value = campana.id
  if (catalogosEstado.value[campana.id] !== 'loaded') void cargarCatalogoCampana(campana.id)
}

const cargarKitsModal = async (campana: any) => {
  if (!campana?.id) return
  cargandoKitsModal.value = true
  errorKitsModal.value = ''
  try {
    const res = await fetch(`${API_BASE}/workspace/admin/kits?campana_id=${campana.id}`, { headers: hdrsGet() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      kitsCampanaModal.value = extraerKits(json)
    } else {
      errorKitsModal.value = json.message ?? 'No se pudieron cargar los kits de la campaña.'
    }
  } catch {
    errorKitsModal.value = 'No se pudo conectar. Inténtalo de nuevo.'
  } finally {
    cargandoKitsModal.value = false
  }
}

const productosKitCatalogo = (kit: any) => {
  const productos = kit?.contenido_detalle?.productos
  if (Array.isArray(productos)) {
    return productos.map((producto: any) => typeof producto === 'string'
      ? { nombre: producto, descripcion: '', imagen_url: '' }
      : { ...producto, nombre: producto?.nombre ?? 'Producto sin nombre' })
  }
  if (productos && typeof productos === 'object') {
    return Object.entries(productos).map(([nombre, detalle]) => typeof detalle === 'object' && detalle !== null
      ? { ...(detalle as Record<string, unknown>), nombre: (detalle as any).nombre ?? nombre }
      : { nombre, descripcion: '', imagen_url: '' })
  }
  return []
}

const crearKitParaCampana = (campana: any) => {
  campanaKitTarget.value = campana
  abrirModalKit()
}

const crearKitDesdeModalCampana = () => {
  campanaKitTarget.value = campanaEditando.value
  abrirModalKit()
}

// ── API ──
const hdrsGet = () => authHeaders({ Accept: 'application/json' })

const cargarKitsMeta = async (campanaId: number) => {
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/kits?campana_id=${campanaId}`, { headers: hdrsGet() })
    const json = await res.json()
    if (json.status === 'success') {
      const lista: any[] = json.data.data ?? json.data
      const stockCentral = lista.reduce((a: number, k: any) => a + stockCentralDisponible(k), 0)
      const stockMovidoRedTotal = lista.reduce((a: number, k: any) => a + stockMovidoRed(k), 0)
      const baseOperativa = stockCentral + stockMovidoRedTotal
      const progreso = baseOperativa > 0 ? Math.round((stockMovidoRedTotal / baseOperativa) * 100) : 0
      kitsMeta.value[campanaId] = { total: lista.length, stockCentral, stockMovidoRed: stockMovidoRedTotal, progreso }
    }
  } catch { /* silencioso */ }
}

const cargarCampanas = async (pagina = 1) => {
  cargando.value = true; errorMsg.value = ''; campaignListError.value = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/campanas?page=${pagina}`, { headers: hdrsGet() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      campanas.value = json.data.data ?? json.data
      meta.value = { total: json.data.total ?? campanas.value.length, current_page: json.data.current_page ?? 1, last_page: json.data.last_page ?? 1 }
      // cargar metadatos de kits para cada campaña
      campanas.value.forEach((c: any) => cargarKitsMeta(c.id))
      if (campanaSeleccionada.value) {
        const refreshedCampaign = campanas.value.find((item: any) => item.id === campanaSeleccionada.value.id)
        if (refreshedCampaign) {
          campanaSeleccionada.value = { ...campanaSeleccionada.value, ...refreshedCampaign }
        }
      }
    } else { campaignListError.value = json.message ?? 'No se pudieron cargar las campañas.' }
  } catch { campaignListError.value = 'No se pudo conectar con el servidor.' }
  finally { cargando.value = false }
}

const cambiarPagina = (p: number) => cargarCampanas(p)

const abrirModalCampana = (campana?: any) => {
  formErrors.value = {}
  campaignFormError.value = ''
  errorMsg.value = ''
  errorImagenCampana.value = ''
  errorSubidaImagenCampana.value = ''
  imagenCampanaPendienteId.value = null
  imagenCampanaPendienteEsCreacion.value = false
  limpiarSeleccionImagenCampana()
  kitsCampanaModal.value = []
  errorKitsModal.value = ''
  if (campana) {
    modoEdicion.value = true; campanaEditando.value = campana
    campanaKitTarget.value = campana
    imagenCampanaActual.value = campana.imagen_url ?? ''
    formCampana.value = {
      nombre: campana.nombre,
      descripcion: campana.descripcion ?? '',
      estado: campana.estado,
      fecha_inicio: toDateInputValue(campana.fecha_inicio),
      fecha_fin: toDateInputValue(campana.fecha_fin),
    }
    void cargarKitsModal(campana)
  } else {
    modoEdicion.value = false; campanaEditando.value = null
    campanaKitTarget.value = null
    imagenCampanaActual.value = ''
    formCampana.value = { nombre: '', descripcion: '', estado: 'borrador', fecha_inicio: '', fecha_fin: '' }
  }
  modalCampana.value = true
}

const guardarImagenCampana = async (campanaId: number): Promise<{ ok: boolean; message: string; imagenUrl?: string }> => {
  const image = imagenCampanaSeleccionada.value
  if (!image) return { ok: true, message: '' }

  const formData = new FormData()
  formData.append('imagen', image)
  subiendoImagenCampana.value = true
  try {
    const res = await fetch(`${API_BASE}/workspace/admin/campanas/${campanaId}/imagen`, {
      method: 'POST',
      headers: authHeaders({ Accept: 'application/json' }),
      body: formData,
    })
    let json: any
    try {
      json = await res.json()
    } catch {
      return { ok: false, message: 'La respuesta de subida de imagen no fue válida.' }
    }
    if (!res.ok || json.status !== 'success') {
      return { ok: false, message: json.message ?? 'No se pudo subir la imagen.' }
    }
    return {
      ok: true,
      message: json.message ?? 'Imagen subida correctamente.',
      imagenUrl: json.data?.imagen_url ?? json.data?.campana?.imagen_url,
    }
  } catch {
    return { ok: false, message: 'No se pudo conectar para subir la imagen.' }
  } finally {
    subiendoImagenCampana.value = false
  }
}

const reintentarSubidaImagenCampana = async () => {
  if (!imagenCampanaPendienteId.value || !imagenCampanaSeleccionada.value) return
  errorSubidaImagenCampana.value = ''
  const result = await guardarImagenCampana(imagenCampanaPendienteId.value)
  if (!result.ok) {
    errorSubidaImagenCampana.value = imagenCampanaPendienteEsCreacion.value
      ? `Campaña creada, pero la imagen no se pudo subir. ${result.message}`
      : `Campaña guardada, pero la imagen no se pudo subir. ${result.message}`
    return
  }
  if (result.imagenUrl) imagenCampanaActual.value = result.imagenUrl
  modalCampana.value = false
  successMsg.value = result.message
  imagenCampanaPendienteId.value = null
  imagenCampanaPendienteEsCreacion.value = false
  errorSubidaImagenCampana.value = ''
  limpiarSeleccionImagenCampana()
  await cargarCampanas(meta.value.current_page)
}

const guardarCampana = async () => {
  formErrors.value = {}
  campaignFormError.value = ''
  errorSubidaImagenCampana.value = ''
  const nombre = formCampana.value.nombre.trim()
  if (!nombre) formErrors.value.nombre = 'El nombre es obligatorio.'
  else if (nombre.length > 100) formErrors.value.nombre = 'El nombre no puede superar 100 caracteres.'
  if (
    formCampana.value.fecha_inicio
    && formCampana.value.fecha_fin
    && formCampana.value.fecha_inicio > formCampana.value.fecha_fin
  ) {
    formErrors.value.fecha_rango = 'La fecha de inicio debe ser anterior o igual a la fecha de fin.'
  }
  if (errorImagenCampana.value) {
    campaignFormError.value = 'Corrige el archivo de imagen antes de guardar.'
  }
  const invalidFields = Object.keys(formErrors.value).filter((field) => Boolean(formErrors.value[field]))
  if (invalidFields.length || errorImagenCampana.value) {
    if (invalidFields.length) await focusCampaignError(invalidFields)
    return
  }
  guardando.value = true
  limpiarMensajes()
  try {
    const url    = modoEdicion.value ? `${API_BASE}/workspace/admin/campanas/${campanaEditando.value.id}` : `${API_BASE}/workspace/admin/campanas`
    const method = modoEdicion.value ? 'PUT' : 'POST'
    const payload = {
      ...formCampana.value,
      estado: modoEdicion.value ? formCampana.value.estado : 'borrador',
    }
    const res    = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(payload) })
    const json   = await res.json()
    if (res.ok && json.status === 'success') {
      campaignFormError.value = ''
      const savedCampaign = json.data?.campana ?? json.data
      const rawCampaignId = savedCampaign?.id ?? (modoEdicion.value ? campanaEditando.value?.id : undefined)
      const campaignId = typeof rawCampaignId === 'number' ? rawCampaignId : Number(rawCampaignId)
      if (imagenCampanaSeleccionada.value && Number.isInteger(campaignId) && campaignId > 0) {
        const isCreation = !modoEdicion.value
        const uploadResult = await guardarImagenCampana(campaignId)
        if (!uploadResult.ok) {
          imagenCampanaPendienteId.value = campaignId
          imagenCampanaPendienteEsCreacion.value = isCreation
          errorSubidaImagenCampana.value = isCreation
            ? `Campaña creada, pero la imagen no se pudo subir. ${uploadResult.message}`
            : `Campaña guardada, pero la imagen no se pudo subir. ${uploadResult.message}`
          modoEdicion.value = true
          campanaEditando.value = { ...savedCampaign, id: campaignId }
          if (campanaSeleccionada.value) campanaSeleccionada.value = savedCampaign
          await cargarCampanas(meta.value.current_page)
          return
        }
        if (uploadResult.imagenUrl) imagenCampanaActual.value = uploadResult.imagenUrl
      } else if (imagenCampanaSeleccionada.value) {
        successMsg.value = 'Campaña creada, pero la imagen no se pudo subir: el servidor no devolvió el identificador de la campaña.'
      } else {
        successMsg.value = json.message ?? 'Campaña guardada correctamente.'
      }
      modalCampana.value = false
      imagenCampanaPendienteId.value = null
      imagenCampanaPendienteEsCreacion.value = false
      errorSubidaImagenCampana.value = ''
      limpiarSeleccionImagenCampana()
      if (campanaSeleccionada.value) campanaSeleccionada.value = savedCampaign
      await cargarCampanas(meta.value.current_page)
    }
    else {
      const responseErrors: Record<string, unknown> =
        json.errors && typeof json.errors === 'object' ? json.errors : {}
      for (const [field, value] of Object.entries(responseErrors)) {
        const firstError = Array.isArray(value) ? value[0] : value
        if (typeof firstError === 'string') {
          const normalizedField = field.replace(/\.\d+$/, '')
          if (['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'fecha_rango'].includes(normalizedField)) {
            formErrors.value[normalizedField] = firstError
          }
        }
      }

      const backendMessage = typeof json.message === 'string' ? json.message : ''
      const combinedErrorText = `${backendMessage} ${getCampaignErrorText(responseErrors)}`
      const isDateOverlap = /cruz|superpuest|solap|overlap/i.test(combinedErrorText)
      if (isDateOverlap) {
        delete formErrors.value.fecha_inicio
        delete formErrors.value.fecha_fin
        formErrors.value.fecha_rango = getDateOverlapMessage(combinedErrorText)
        campaignFormError.value = formErrors.value.fecha_rango
      } else {
        campaignFormError.value =
          getCampaignErrorText(responseErrors)
          || backendMessage
          || 'No se pudo guardar la campaña. Inténtalo de nuevo.'
      }

      const invalidFields = Object.keys(formErrors.value).filter((field) => Boolean(formErrors.value[field]))
      if (invalidFields.length > 0) await focusCampaignError(invalidFields)
      if (res.status === 422 && !campaignFormError.value) {
        campaignFormError.value = 'Revisa los campos marcados e inténtalo de nuevo.'
      }
    }
  } catch {
    errorMsg.value = ''
    campaignFormError.value = 'No se pudo conectar. Inténtalo de nuevo.'
  }
  finally { guardando.value = false }
}

const eliminarCampana = async () => {
  if (!campanaAEliminar.value) return
  guardando.value = true
  limpiarMensajes()
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/campanas/${campanaAEliminar.value.id}`, { method: 'DELETE', headers: hdrsGet() })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      successMsg.value = json.message ?? 'Campaña eliminada.'
      modalEliminar.value = false
      if (campanaSeleccionada.value?.id === campanaAEliminar.value.id) {
        volverALista()
      }
      await cargarCampanas(meta.value.current_page)
    }
    else { errorMsg.value = json.message ?? 'Error al eliminar.' }
  } catch { errorMsg.value = 'No se pudo conectar.' }
  finally { guardando.value = false }
}

const abrirModalEliminar = (campana: any) => {
  campanaAEliminar.value = campana
  modalEliminar.value = true
}

const verDetalle = async (campana: any) => {
  cargandoKits.value = true
  limpiarMensajes()
  try {
    const res = await fetch(`${API_BASE}/workspace/admin/campanas/${campana.id}`, { headers: hdrsGet() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      campanaSeleccionada.value = json.data
      kits.value = json.data.kits ?? []
      await cargarKitsMeta(campana.id)
    } else {
      errorMsg.value = json.message ?? 'Error al cargar el detalle de la campaña.'
    }
  } catch {
    errorMsg.value = 'No se pudo cargar el detalle de la campaña.'
  } finally {
    cargandoKits.value = false
  }
}

const volverALista = () => { campanaSeleccionada.value = null; kits.value = [] }

const cargarKits = async (campanaId: number) => {
  cargandoKits.value = true; errorMsg.value = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/kits?campana_id=${campanaId}`, { headers: hdrsGet() })
    const json = await res.json()
    if (json.status === 'success') { kits.value = json.data.data ?? json.data }
    else { errorMsg.value = json.message ?? 'Error al cargar kits.' }
  } catch { errorMsg.value = 'No se pudo conectar.' }
  finally { cargandoKits.value = false }
}

const cambiarEstadoCampana = async (accion: 'activar' | 'pausar' | 'finalizar') => {
  if (!campanaSeleccionada.value) return

  guardando.value = true
  limpiarMensajes()

  try {
    const res = await fetch(`${API_BASE}/workspace/admin/campanas/${campanaSeleccionada.value.id}/${accion}`, {
      method: 'POST',
      headers: hdrsGet(),
    })
    const json = await res.json()

    if (res.ok && json.status === 'success') {
      successMsg.value = json.message ?? 'Estado de campaña actualizado.'
      await cargarCampanas(meta.value.current_page)
      await verDetalle({ id: campanaSeleccionada.value.id })
    } else {
      errorMsg.value = json.message ?? 'No se pudo cambiar el estado de la campaña.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar para cambiar el estado de la campaña.'
  } finally {
    guardando.value = false
  }
}

const abrirModalKit = (kit?: any) => {
  kitErrors.value = {}
  productCellErrors.value = {}
  limpiarFotosKit()
  if (kit) {
    modoEdicionKit.value = true
    kitEditando.value = kit
    const contenidoDetalle = kit.contenido_detalle
    contenidoDetalleExtra.value = contenidoDetalle && typeof contenidoDetalle === 'object' && !Array.isArray(contenidoDetalle)
      ? { ...contenidoDetalle }
      : {}
    delete contenidoDetalleExtra.value.productos
    const productosExistentes = normalizarProductosKit(contenidoDetalle)
    formKit.value = {
      nombre: kit.nombre ?? '',
      descripcion: kit.descripcion ?? '',
      precio_unitario: String(kit.precio_unitario ?? ''),
      stock_central: String(kit.stock_central ?? ''),
      productos: productosExistentes.length > 0
        ? productosExistentes
        : [createKitProduct()],
    }
    if (kit.imagen_url) {
      kitFotos.value = [{ id: ++kitPhotoId, file: null, preview: kit.imagen_url, portada: true }]
    }
  } else {
    modoEdicionKit.value = false
    kitEditando.value = null
    contenidoDetalleExtra.value = {}
    formKit.value = crearFormKitVacio()
  }
  modalKit.value = true
}

const agregarProducto = () => formKit.value.productos.push(createKitProduct())
const eliminarProducto = (i: number) => {
  formKit.value.productos.splice(i, 1)
  productCellErrors.value = {}
}
const moverProducto = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= formKit.value.productos.length) return
  const products = [...formKit.value.productos]
  const current = products[index]
  const target = products[targetIndex]
  if (!current || !target) return
  products[index] = target
  products[targetIndex] = current
  formKit.value.productos = products
  productCellErrors.value = {}
}

const guardarKit = async () => {
  kitErrors.value = {}
  productCellErrors.value = {}
  if (!formKit.value.nombre.trim())       { kitErrors.value.nombre = 'El nombre es obligatorio.'; return }
  if (formKit.value.nombre.length > 100)  { kitErrors.value.nombre = 'El nombre no puede superar 100 caracteres.'; return }
  if (!isValidPositiveDecimal(formKit.value.precio_unitario)) {
    kitErrors.value.precio_unitario = 'Ingresa un precio mayor que cero con hasta 2 decimales.'
    return
  }
  if (formKit.value.stock_central === '') { kitErrors.value.stock_central = 'El stock es obligatorio.'; return }
  if (!isValidIntegerInRange(formKit.value.stock_central, 0, 100000)) {
    kitErrors.value.stock_central = 'Ingresa un entero entre 0 y 100000.'
    return
  }
  const productosValidos = formKit.value.productos.filter(p => p.nombre.trim())
  const productRowIndexes = formKit.value.productos.flatMap((product, index) => product.nombre.trim() ? [index] : [])
  if (productosValidos.length === 0)      { kitErrors.value.contenido_detalle = 'Agrega al menos un producto.'; return }
  const productoInvalido = productosValidos.find((product) =>
    product.nombre.length > 100
    || product.descripcion.length > 500
    || !isValidIntegerInRange(String(product.cantidad), 1, 100000),
  )
  if (productoInvalido) {
    const index = formKit.value.productos.indexOf(productoInvalido)
    if (productoInvalido.nombre.length > 100) productCellErrors.value[`${index}.nombre`] = 'El nombre no puede superar 100 caracteres.'
    if (productoInvalido.descripcion.length > 500) productCellErrors.value[`${index}.descripcion`] = 'La descripción no puede superar 500 caracteres.'
    if (!isValidIntegerInRange(String(productoInvalido.cantidad), 1, 100000)) productCellErrors.value[`${index}.cantidad`] = 'Ingresa una cantidad entre 1 y 100000.'
    return
  }

  guardando.value = true
  limpiarMensajes()
  try {
    const campanaId = campanaKitTarget.value?.id ?? campanaSeleccionada.value?.id
    if (!campanaId) {
      errorMsg.value = 'Selecciona una campaña para agregar el kit.'
      return
    }
    const body = {
      campana_id:        campanaId,
      nombre:            formKit.value.nombre,
      descripcion:       formKit.value.descripcion,
      precio_unitario:   parseFloat(formKit.value.precio_unitario),
      stock_central:     parseInt(formKit.value.stock_central),
      contenido_detalle: {
        ...contenidoDetalleExtra.value,
        productos: productosValidos.map((product) => ({
          ...product.preservedFields,
          ...(product.imagen_url ? { imagen_url: product.imagen_url } : {}),
          nombre: product.nombre,
          descripcion: product.descripcion,
          cantidad: product.cantidad,
        })),
      },
    }
    const url = modoEdicionKit.value
      ? `${API_BASE}/workspace/admin/kits/${kitEditando.value.id}`
      : `${API_BASE}/workspace/admin/kits`
    const method = modoEdicionKit.value ? 'PUT' : 'POST'
    const res  = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(body) })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      const tieneFotosLocales = kitPhotosModified.value
      cerrarModalKit()
      successMsg.value = tieneFotosLocales
        ? `${json.message ?? (modoEdicionKit.value ? 'Kit actualizado.' : 'Kit creado.')} Las fotos no se guardaron: la carga estará disponible próximamente.`
        : json.message ?? (modoEdicionKit.value ? 'Kit actualizado.' : 'Kit creado.')
      await cargarKits(campanaId)
      await cargarKitsMeta(campanaId)
      await cargarKitsModal(campanaKitTarget.value ?? campanaSeleccionada.value)
      await cargarCatalogoCampana(campanaId)
      if (modoEdicionKit.value) {
        kitDetalle.value = json.data
        modalContenido.value = true
      }
    }
    else if (res.status === 422 && json.errors) {
      for (const [field, rawMessage] of Object.entries(json.errors as Record<string, unknown>)) {
        const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage
        if (typeof message !== 'string') continue
        const productField = field.match(/(?:contenido_detalle\.)?productos\.(\d+)\.(nombre|descripcion|cantidad)$/)
        if (productField) {
          const [, row, cell] = productField
          if (row !== undefined && cell !== undefined) {
              const editorRow = productRowIndexes[Number(row)]
              if (editorRow !== undefined) {
                productCellErrors.value[`${editorRow}.${cell}`] = message
                continue
              }
            }
        }
        kitErrors.value[field] = message
      }
    }
    else { errorMsg.value = json.message ?? (modoEdicionKit.value ? 'Error al actualizar kit.' : 'Error al crear kit.') }
  } catch { errorMsg.value = 'No se pudo conectar.' }
  finally { guardando.value = false }
}

const verDetalleKit = (k: any) => { kitDetalle.value = k; modalContenido.value = true }

const editarKitDesdeDetalle = () => {
  if (!kitDetalle.value) return

  modalContenido.value = false
  abrirModalKit(kitDetalle.value)
}

const toggleKitActivo = async (kit: any) => {
  if (!kit?.id || !campanaSeleccionada.value) return

  guardando.value = true
  limpiarMensajes()

  try {
    const res = await fetch(`${API_BASE}/workspace/admin/kits/${kit.id}/toggle`, {
      method: 'POST',
      headers: hdrsGet(),
    })
    const json = await res.json()

    if (res.ok && json.status === 'success') {
      successMsg.value = json.message ?? 'Estado del kit actualizado.'
      kitDetalle.value = json.data
      await cargarKits(campanaSeleccionada.value.id)
      await cargarKitsMeta(campanaSeleccionada.value.id)
    } else {
      errorMsg.value = json.message ?? 'No se pudo actualizar el estado del kit.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar para actualizar el estado del kit.'
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  await ensureCurrencyLoaded()
  await cargarCampanas()
})
</script>

<style>
html, body, #app { margin:0!important; padding:0!important; height:100%!important; background:#f4f6f9!important; font-family:'Segoe UI',Arial,sans-serif; }
</style>

<style scoped>
.dashboard-layout { display:flex; min-height:100vh; background:#f4f6f9; }
.sidebar { width:200px; background:#0f1b2d; display:flex; flex-direction:column; padding:0; position:fixed; top:0; left:0; height:100vh; z-index:100; border-right:1px solid #1a2d45; overflow-y:auto; }
.sidebar-logo { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px 16px 16px; border-bottom:1px solid #1a2d45; gap:6px; }
.sidebar-logo-img { width:56px; height:56px; object-fit:contain; }
.sidebar-brand { font-size:13px; font-weight:800; color:#ffffff; letter-spacing:3px; text-align:center; }
.sidebar-section-label { font-size:10px; font-weight:700; color:#4a6080; letter-spacing:1.5px; text-transform:uppercase; padding:14px 18px 6px; }
.sidebar-nav { display:flex; flex-direction:column; gap:2px; padding:0 10px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; color:#6b8aaa; text-decoration:none; font-size:13px; font-weight:500; transition:background 0.2s,color 0.2s; white-space:nowrap; }
.nav-item:hover { background:#162236; color:#a0c4e8; }
.nav-item.active { background:#1a3a5c; color:#4ab8f5; font-weight:600; }
.nav-item.nav-logout { color:#ef4444; margin-top:2px; }
.nav-item.nav-logout:hover { background:#2a1010; color:#f87171; }
.sidebar-bottom { display:flex; flex-direction:column; gap:2px; padding:0 10px 16px; }
.main-content { margin-left:200px; flex:1; display:flex; flex-direction:column; min-height:100vh; }
.topbar { background:white; height:56px; display:flex; align-items:center; padding:0 24px; gap:16px; border-bottom:1px solid #eee; position:sticky; top:0; z-index:50; }
.topbar-left { min-width:200px; }
.breadcrumb { font-size:13px; color:#999; }
.breadcrumb strong { color:#333; }
.breadcrumb-link { color:#4ab8f5; text-decoration:none; }
.breadcrumb-link:hover { text-decoration:underline; }
.topbar-center { flex:1; display:flex; justify-content:center; }
.search-box { display:flex; align-items:center; gap:8px; background:#f4f6f9; border-radius:20px; padding:6px 14px; width:280px; }
.search-input { border:none; background:transparent; outline:none; font-size:13px; color:#333; width:100%; }
.form-help { display:block; margin:4px 0 8px; color:#64748b; font-size:12px; line-height:1.4; }
.topbar-right { display:flex; align-items:center; gap:16px; min-width:220px; justify-content:flex-end; }
.user-info { display:flex; align-items:center; gap:10px; }
.user-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); color:white; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center; }
.user-details { display:flex; flex-direction:column; }
.user-name { font-size:13px; font-weight:600; color:#333; }
.user-email { font-size:11px; color:#999; }
.notif-btn { position:relative; background:none; border:none; cursor:pointer; color:#666; padding:6px; }
.notif-badge { position:absolute; top:2px; right:2px; background:#ef4444; color:white; font-size:9px; width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.page-body { padding:24px 28px; display:flex; flex-direction:column; gap:20px; }
.page-header { display:flex; align-items:center; justify-content:space-between; }
.page-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.page-subtitle { font-size:13px; color:#999; margin:0; }
.detalle-header { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.detalle-info { flex:1; }
.detalle-meta { display:flex; align-items:center; gap:12px; margin-top:6px; }
.detalle-acciones { display:flex; gap:10px; align-items:center; }
.meta-fechas { font-size:12px; color:#666; }
.btn-back { display:flex; align-items:center; gap:6px; padding:8px 14px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; white-space:nowrap; }
.btn-back:hover { background:#f4f6f9; }
.btn-primary { display:flex; align-items:center; gap:6px; padding:9px 18px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
.btn-outline { display:flex; align-items:center; gap:6px; padding:9px 18px; border:1px solid #4ab8f5; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#1a6ab5; cursor:pointer; }
.btn-outline:hover { background:#eff6ff; }
.btn-secondary { padding:9px 18px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; }
.btn-danger { padding:9px 18px; border:none; border-radius:8px; background:#ef4444; font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-danger:disabled { opacity:0.6; cursor:not-allowed; }
.alert-error { position:relative; z-index:2201; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-success { position:relative; z-index:2201; background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-close { background:none; border:none; cursor:pointer; color:#b91c1c; font-size:16px; }
.content-layout { display:flex; gap:20px; align-items:flex-start; }
.filters-panel { width:200px; flex-shrink:0; background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.filters-title { font-size:14px; font-weight:700; color:#1a1a1a; margin:0 0 16px; }
.filter-section { margin-bottom:20px; }
.filter-label { font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px; }
.filter-options { display:flex; flex-direction:column; gap:6px; }
.filter-radio { display:flex; align-items:center; gap:8px; font-size:13px; color:#444; cursor:pointer; padding:5px 8px; border-radius:6px; transition:background 0.15s; }
.filter-radio input { display:none; }
.filter-radio.active { background:#eff6ff; color:#1a6ab5; font-weight:600; }
.radio-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.date-label { font-size:11px; color:#888; display:block; margin-bottom:4px; }
.date-input { width:100%; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-size:12px; color:#333; outline:none; box-sizing:border-box; }
.date-input:focus { border-color:#4ab8f5; }
.resumen-box { background:#f8fafc; border-radius:8px; padding:12px; }
.resumen-title { font-size:12px; font-weight:700; color:#444; margin:0 0 10px; }
.resumen-row { display:flex; justify-content:space-between; font-size:12px; color:#666; padding:3px 0; border-bottom:1px solid #eee; }
.resumen-row:last-child { border-bottom:none; }
.resumen-val { font-weight:700; color:#1a1a1a; }
.table-area { flex:1; background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.table-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:12px 14px; vertical-align:middle; }
.tr-clickable { cursor:pointer; }
.camp-name { font-weight:600; color:#1a1a1a; font-size:13px; }
.camp-desc { font-size:11px; color:#999; margin-top:2px; }
.td-dates { font-size:12px; color:#666; display:flex; flex-direction:column; gap:2px; }
.td-center { text-align:center; font-weight:600; color:#333; }
.td-actions { display:flex; gap:6px; }
.td-progress { display:flex; align-items:center; gap:8px; }
.progress-bar { flex:1; height:6px; background:#e2e8f0; border-radius:10px; overflow:hidden; min-width:60px; }
.progress-fill { height:100%; border-radius:10px; transition:width 0.3s; }
.progress-pct { font-size:12px; font-weight:600; color:#555; min-width:32px; }
.btn-action { background:#eff6ff; border:1px solid #bfdbfe; cursor:pointer; font-size:12px; font-weight:600; color:#1d4ed8; padding:6px 10px; border-radius:6px; transition:background 0.15s,border-color 0.15s; }
.btn-action:hover { background:#dbeafe; border-color:#93c5fd; }
.empty-state { text-align:center; color:#999; padding:40px; font-size:13px; }
.stock-ok { color:#166534; font-weight:700; }
.stock-agotado { color:#b91c1c; font-weight:700; }
.badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
.estado-activa     { background:#dcfce7; color:#166534; }
.estado-finalizada { background:#e0e7ff; color:#3730a3; }
.estado-pausada    { background:#fef3c7; color:#b45309; }
.estado-borrador   { background:#f1f5f9; color:#64748b; }
.pagination { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:16px; }
.page-btn { padding:6px 14px; border:1px solid #ddd; border-radius:6px; background:white; cursor:pointer; font-size:16px; color:#555; }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.page-info { font-size:13px; color:#666; }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:#999; font-size:13px; }
.spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal-overlay--campaign { z-index:2100; box-sizing:border-box; padding:12px; }
.modal { background:white; border-radius:12px; width:480px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; }
.modal-campaign { display:flex; flex-direction:column; overflow:hidden; max-height:90vh; max-height:90dvh; }
.modal-campaign .modal-header { flex:0 0 auto; }
.modal-lg { width:560px; }
.modal-sm { width:380px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-header__content { display:flex; min-width:0; flex:1; flex-direction:column; gap:12px; }
.modal-header h2 { font-size:16px; font-weight:700; color:#1a1a1a; margin:0; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#999; }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.campaign-modal-body { min-height:0; flex:1 1 auto; overflow-y:auto; overscroll-behavior:contain; }
.modal-body p { font-size:14px; color:#555; margin:0; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
.campaign-modal-footer { position:sticky; bottom:0; flex:0 0 auto; border-top:1px solid #e2e8f0; padding-top:14px; background:#fff; }
.campaign-form-alert { display:flex; align-items:flex-start; gap:8px; padding:10px 12px; border:1px solid #fecaca; border-radius:8px; background:#fef2f2; color:#b91c1c; font-size:13px; line-height:1.4; }
.campaign-form-alert svg { flex:0 0 auto; margin-top:1px; }
.campaign-draft-note { display:flex; align-items:flex-start; gap:10px; color:#64748b; font-size:12px; line-height:1.45; }
.campaign-draft-note .badge { flex:0 0 auto; }
.campaign-current-state { display:flex; align-items:center; gap:10px; }
.campaign-current-state .form-label { color:#555; font-size:12px; font-weight:600; }
.campaign-date-row .form-group { min-width:0; }
.campaign-date-error { display:block; margin-top:-8px; }
.section-title { font-size:13px; font-weight:700; color:#334155; margin-bottom:10px; }
.form-group { display:flex; flex-direction:column; gap:6px; flex:1; }
.form-group label { font-size:12px; font-weight:600; color:#555; }
.form-input { border:1px solid #e2e8f0; border-radius:8px; padding:9px 12px; font-size:13px; color:#333; outline:none; width:100%; box-sizing:border-box; }
.form-input:focus { border-color:#4ab8f5; }
.form-input-sm { width:80px !important; }
.form-textarea { resize:vertical; min-height:70px; }
.form-row { display:flex; gap:12px; }
.form-error { font-size:11px; color:#ef4444; }
.producto-row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.btn-remove { background:none; border:none; cursor:pointer; color:#ef4444; font-size:16px; padding:4px; }
.btn-add-producto { background:none; border:1px dashed #4ab8f5; color:#1a6ab5; font-size:12px; font-weight:600; padding:7px 14px; border-radius:8px; cursor:pointer; margin-top:4px; }
.btn-add-producto:hover { background:#eff6ff; }
.kit-detail-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding-bottom:4px; }
.kit-detail-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; }
.kit-detail-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:4px; }
.kit-detail-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#64748b; }
.campaign-list-area { min-width:0; flex:1; }
.campaign-list-toolbar { display:flex; justify-content:flex-end; margin-bottom:16px; }
.campaign-card-list { display:grid; gap:16px; }
.campaign-card { overflow:hidden; border:1px solid #e2e8f0; border-radius:12px; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.campaign-card-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px; }
.campaign-card-toggle { display:flex; align-items:center; gap:16px; flex:1; min-width:0; padding:0; border:0; background:transparent; color:inherit; text-align:left; cursor:pointer; }
.campaign-card-image { width:112px; aspect-ratio:16/9; flex:0 0 auto; overflow:hidden; border-radius:8px; background:#f1f5f9; }
.campaign-card-image img,.kit-catalog-image img,.kit-product-image img,.campaign-kit-modal-image img,.campaign-image-preview>img { display:block; width:100%; height:100%; object-fit:cover; }
.campaign-image-placeholder { display:flex; width:100%; height:100%; align-items:center; justify-content:center; color:#94a3b8; background:#f1f5f9; }
.campaign-card-copy { display:flex; min-width:0; flex-direction:column; gap:8px; }
.campaign-card-title { color:#172033; font-size:16px; font-weight:700; overflow-wrap:anywhere; }
.campaign-card-meta { display:flex; align-items:center; flex-wrap:wrap; gap:8px; color:#64748b; font-size:12px; }
.campaign-card-meta .badge { flex:0 0 auto; }
.campaign-card-chevron { flex:0 0 auto; color:#1a6ab5; font-size:24px; font-weight:500; }
.campaign-card-actions { display:flex; flex:0 0 auto; gap:8px; }
.campaign-card-actions .btn-action { white-space:nowrap; }
.campaign-catalog { padding:16px; border-top:1px solid #e2e8f0; background:#f8fafc; }
.campaign-catalog-heading,.campaign-section-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.campaign-catalog-heading { margin-bottom:16px; }
.campaign-catalog-heading h2,.campaign-section-heading h3 { margin:0; color:#1f2937; font-size:14px; font-weight:700; }
.kit-catalog-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
.kit-catalog-card { min-width:0; padding:16px; border:1px solid #e2e8f0; border-radius:10px; background:#fff; }
.kit-catalog-open { display:grid; width:100%; gap:8px; padding:0; border:0; background:transparent; color:inherit; text-align:left; cursor:pointer; }
.kit-catalog-image { display:block; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:7px; background:#f1f5f9; }
.kit-catalog-title { color:#1f2937; font-size:14px; font-weight:700; overflow-wrap:anywhere; }
.kit-product-list { display:grid; gap:8px; margin:8px 0 0; padding:8px 0 0; border-top:1px solid #e2e8f0; list-style:none; }
.kit-product-list li { display:flex; min-width:0; align-items:center; gap:8px; }
.kit-product-image { width:40px; height:40px; flex:0 0 auto; overflow:hidden; border-radius:6px; background:#f1f5f9; }
.kit-product-copy { display:flex; min-width:0; flex-direction:column; gap:2px; }
.kit-product-copy strong,.kit-product-copy small { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kit-product-copy strong { color:#334155; font-size:12px; }
.kit-product-copy small { color:#64748b; font-size:11px; }
.campaign-catalog-empty,.campaign-empty-state { padding:24px; color:#64748b; text-align:center; }
.campaign-load-error { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px; border:1px solid #fecaca; border-radius:8px; background:#fff7f7; color:#991b1b; }
.campaign-load-error p { margin:0; font-size:13px; }
.campaign-skeleton,.kit-skeleton { display:flex; gap:16px; padding:16px; border:1px solid #e2e8f0; border-radius:12px; background:#fff; }
.campaign-skeleton-image { width:112px; aspect-ratio:16/9; flex:0 0 auto; border-radius:8px; background:#e9edf2; }
.campaign-skeleton-copy { display:grid; flex:1; align-content:center; gap:10px; }
.campaign-skeleton-copy span,.kit-skeleton span,.campaign-kit-modal-skeleton span { height:12px; border-radius:6px; background:#e9edf2; animation:campaign-pulse 1.2s ease-in-out infinite alternate; }
.campaign-skeleton-copy span:first-child { width:45%; height:16px; }
.campaign-skeleton-copy span:nth-child(2) { width:75%; }
.campaign-skeleton-copy span:nth-child(3) { width:30%; }
.kit-skeleton { min-height:160px; flex-direction:column; justify-content:center; }
.kit-skeleton span:first-child { width:100%; height:80px; }
.kit-skeleton span:nth-child(2) { width:70%; }
.kit-skeleton span:nth-child(3) { width:45%; }
@keyframes campaign-pulse { to { opacity:.45; } }
.campaign-image-section,.campaign-kits-section { display:grid; gap:12px; }
.campaign-image-ratio { color:#64748b; font-size:12px; }
.campaign-image-dropzone { display:grid; min-height:150px; place-content:center; justify-items:center; gap:8px; padding:16px; border:1px dashed #94a3b8; border-radius:10px; background:#f8fafc; color:#475569; cursor:pointer; text-align:center; }
.campaign-image-dropzone:hover,.campaign-image-preview:hover { border-color:#4ab8f5; }
.campaign-image-dropzone>span:last-child { color:#64748b; font-size:12px; }
.campaign-image-preview { position:relative; height:auto; aspect-ratio:16/9; overflow:hidden; border:1px solid #e2e8f0; border-radius:10px; background:#f1f5f9; }
.campaign-image-preview>img,.campaign-image-preview>.campaign-image-placeholder { position:absolute; inset:0; }
.campaign-image-controls { position:absolute; right:8px; bottom:8px; display:flex; gap:8px; }
.campaign-image-upload-status { display:flex; align-items:center; justify-content:space-between; gap:8px; color:#64748b; font-size:12px; }
.campaign-image-upload-status .btn-outline { font-size:11px; white-space:nowrap; }
.campaign-image-upload-status .btn-outline:disabled { opacity:.6; cursor:not-allowed; }
.kit-editor-section { display:grid; gap:12px; padding:16px; border:1px solid #e2e8f0; border-radius:10px; background:#fff; }
.kit-editor-section-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.kit-editor-section-heading h3 { margin:0; color:#1f2937; font-size:14px; font-weight:700; }
.kit-editor-section-heading .form-help { margin:4px 0 0; }
.kit-photo-count { color:#64748b; font-size:12px; white-space:nowrap; }
.kit-photo-dropzone { display:flex; min-height:72px; align-items:center; justify-content:center; flex-wrap:wrap; gap:8px; padding:12px; border:1px dashed #94a3b8; border-radius:8px; background:#f8fafc; color:#475569; font-size:12px; text-align:center; }
.kit-photo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; }
.kit-photo-card { position:relative; min-width:0; overflow:hidden; border:1px solid #e2e8f0; border-radius:8px; background:#fff; }
.kit-photo-card>img { display:block; width:100%; aspect-ratio:16/9; object-fit:cover; }
.kit-photo-cover-badge { position:absolute; top:6px; left:6px; padding:4px 8px; border-radius:20px; background:#1a6ab5; color:#fff; font-size:10px; font-weight:700; }
.kit-photo-actions { display:flex; align-items:center; flex-wrap:wrap; gap:4px; padding:8px; }
.kit-photo-actions .btn-action { padding:5px 7px; }
.kit-photo-actions .btn-action:disabled { opacity:.5; cursor:not-allowed; }
.kit-photo-actions .btn-remove { margin-left:auto; }
.kit-photo-upload-status { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; color:#64748b; font-size:12px; }
.kit-photo-upload-status .btn-outline { font-size:11px; }
.kit-photo-upload-status .btn-outline:disabled,.kit-product-image-control .btn-action:disabled { opacity:.65; cursor:not-allowed; }
.kit-products-table-wrap { width:100%; overflow-x:auto; }
.kit-products-table { width:100%; border-collapse:collapse; table-layout:fixed; }
.kit-products-table th,.kit-products-table td { padding:8px; border-bottom:1px solid #e2e8f0; text-align:left; vertical-align:top; }
.kit-products-table th { color:#475569; font-size:11px; font-weight:700; }
.kit-products-table th:first-child { width:132px; }
.kit-products-table th:nth-child(2) { width:19%; }
.kit-products-table th:nth-child(3) { width:32%; }
.kit-products-table th:nth-child(4) { width:100px; }
.kit-product-image-control { display:grid; justify-items:start; gap:8px; }
.kit-product-image-control .btn-action { padding:6px; text-align:left; }
.kit-product-description { min-height:68px; resize:vertical; }
.kit-description-count { display:block; margin-top:4px; color:#64748b; font-size:10px; text-align:right; }
.kit-product-row-actions { display:flex; gap:4px; }
.kit-product-row-actions .btn-action { padding:5px 8px; }
.kit-products-table .form-error { display:block; margin-top:4px; }
.kit-products-table [aria-invalid="true"] { border-color:#ef4444; }
.kit-editor-section button:focus-visible,.kit-products-table input:focus-visible,
.kit-products-table textarea:focus-visible,.kit-photo-dropzone button:focus-visible {
  outline:3px solid #1d8bd1;
  outline-offset:2px;
}
.campaign-kit-modal-list { display:grid; gap:8px; }
.campaign-kit-modal-item { display:flex; align-items:center; gap:8px; padding:8px; border:1px solid #e2e8f0; border-radius:8px; }
.campaign-kit-modal-image { width:64px; height:40px; flex:0 0 auto; overflow:hidden; border-radius:5px; background:#f1f5f9; }
.campaign-kit-modal-name { min-width:0; flex:1; color:#334155; font-size:13px; font-weight:600; overflow-wrap:anywhere; }
.campaign-kit-modal-quantity { color:#64748b; font-size:12px; white-space:nowrap; }
.campaign-kit-modal-skeleton { display:grid; gap:8px; }
.campaign-kit-modal-skeleton span { height:56px; }
.visually-hidden { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.campaign-card-toggle:focus-visible,.kit-catalog-open:focus-visible,.campaign-image-dropzone:focus-visible,
.campaign-card-actions button:focus-visible,.campaign-image-controls button:focus-visible,
.campaign-catalog-heading button:focus-visible,.campaign-section-heading button:focus-visible,
.campaign-modal-body button:focus-visible,.campaign-modal-body input:focus-visible,
.campaign-modal-body textarea:focus-visible {
  outline:3px solid #1d8bd1;
  outline-offset:3px;
}
@media (max-width:640px) {
  .content-layout { flex-direction:column; }
  .filters-panel,.campaign-list-area { width:100%; box-sizing:border-box; }
  .campaign-card-heading { align-items:flex-start; flex-direction:column; gap:8px; }
  .campaign-card-toggle { width:100%; gap:8px; }
  .campaign-card-image { width:88px; }
  .campaign-card-actions { width:100%; }
  .campaign-card-actions .btn-action { flex:1; }
  .campaign-catalog { padding:8px; }
  .kit-catalog-grid { grid-template-columns:1fr; }
  .campaign-image-upload-status { align-items:flex-start; flex-direction:column; }
  .campaign-kit-modal-item { flex-wrap:wrap; }
  .campaign-kit-modal-name { flex-basis:calc(100% - 80px); }
  .campaign-kit-modal-quantity { margin-left:72px; }
  .campaign-load-error { align-items:flex-start; flex-direction:column; }
  .kit-editor-section { padding:8px; }
  .kit-editor-section-heading { align-items:flex-start; flex-direction:column; }
  .kit-photo-grid { grid-template-columns:1fr; }
  .kit-photo-upload-status { align-items:flex-start; flex-direction:column; }
  .kit-products-table,.kit-products-table tbody,.kit-products-table tr,.kit-products-table td { display:block; width:100%; box-sizing:border-box; }
  .kit-products-table thead { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
  .kit-products-table tbody tr { display:grid; grid-template-columns:1fr; gap:8px; padding:12px 0; }
  .kit-products-table tbody tr>td { display:grid; grid-template-columns:88px minmax(0,1fr); align-items:start; gap:8px; padding:4px 0; border:0; }
  .kit-products-table tbody tr>td::before { content:attr(data-label); color:#475569; font-size:11px; font-weight:700; }
  .kit-products-table tbody tr>td:last-child { grid-template-columns:1fr; justify-items:end; }
  .kit-products-table tbody tr>td:last-child::before { content:none; }
  .kit-products-table tbody tr>td[colspan] { display:block; }
  .kit-products-table tbody tr>td[colspan]::before { content:none; }
  .kit-product-image-control { justify-items:start; }
  .kit-products-table .form-input-sm { width:100% !important; }
  .modal-overlay--campaign { align-items:center; padding:8px; }
  .modal-campaign { width:100%; max-width:100%; max-height:calc(100vh - 16px); max-height:calc(100dvh - 16px); }
  .campaign-modal-body { padding:16px; }
  .campaign-date-row { flex-direction:column; gap:14px; }
  .campaign-date-row .form-group { width:100%; }
  .campaign-modal-footer { padding:12px 16px calc(80px + env(safe-area-inset-bottom)); }
  .campaign-modal-footer .btn-secondary,
  .campaign-modal-footer .btn-primary { min-width:0; flex:1; justify-content:center; padding-right:10px; padding-left:10px; }
}
</style>