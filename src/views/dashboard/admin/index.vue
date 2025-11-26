<template>
  <section class="progress-dashboard">
    <header class="dashboard-hero">
      <div class="hero-copy">
        <p class="hero-subtitle">Club Atlético Deportivo Acarigua</p>
        <h2>Seguimiento táctico y físico</h2>
        <p>
          Un tablero inspirado en nuestros colores institucionales para monitorear el progreso integral
          de cada atleta, desde velocidad hasta carga de trabajo semanal.
        </p>
      </div>
      <div class="hero-pill">
        <span>Actualizado: {{ lastUpdate }}</span>
        <el-button type="text" class="pill-button" @click="downloadReport">
          Descargar reporte rápido
        </el-button>
      </div>
    </header>

    <div class="dashboard-main">
      <aside class="dashboard-sidebar">
        <div class="sidebar-card sidebar-card--athletes">
          <div class="sidebar-card__title">
            <span>Atletas destacados</span>
            <small>Progreso último corte</small>
          </div>
          <div v-for="athlete in athletes" :key="athlete.name" class="athlete-line">
            <div class="athlete-meta">
              <strong>{{ athlete.name }}</strong>
              <small>{{ athlete.position }}</small>
            </div>
            <div class="progress-track">
              <span class="progress-fill" :style="{ width: athlete.progress + '%' }" />
            </div>
            <span class="progress-label">{{ athlete.progress }}%</span>
          </div>
        </div>
      </aside>

      <div class="dashboard-charts">
        <div class="chart-row">
          <div class="chart-card chart-card--wide">
            <div class="chart-card__header">
              <div>
                <p>Progreso semanal (Meta vs Real)</p>
                <small>Control de velocidad, resistencia y actitud</small>
              </div>
              <span class="chip">Nivel 85%</span>
            </div>
            <line-chart :chart-data="lineChartData" />
          </div>
        </div>

        <div class="chart-grid">
          <div class="chart-card">
            <div class="chart-card__header">
              <div>
                <p>Intensidad táctica</p>
                <small>Últimas 4 sesiones</small>
              </div>
            </div>
            <raddar-chart />
          </div>
          <div class="chart-card">
            <div class="chart-card__header">
              <div>
                <p>Carga por zonas</p>
                <small>Distribución por posición</small>
              </div>
            </div>
            <pie-chart />
          </div>
          <div class="chart-card">
            <div class="chart-card__header">
              <div>
                <p>Sprints vs Meta</p>
                <small>Comparativa de fuerza explosiva</small>
              </div>
            </div>
            <bar-chart />
          </div>
        </div>

        <!--
        <el-row :gutter="8">
          <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
            <transaction-table />
          </el-col>
          <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
            <todo-list />
          </el-col>
          <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
            <box-card />
          </el-col>
        </el-row>
        -->
      </div>
    </div>
  </section>
</template>

<script>
// import GithubCorner from '@/components/GithubCorner'
// import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
// import TransactionTable from './components/TransactionTable'
// import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    LineChart,
    RaddarChart,
    PieChart,
    BarChart
    // GithubCorner,
    // PanelGroup,
    // TransactionTable,
    // TodoList,
    // BoxCard
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis,
      lastUpdate: 'Hoy, 08:00 CO',
      athletes: [
        { name: 'Carlos Mejía', position: 'Delantero', progress: 88 },
        { name: 'Yamira Cruz', position: 'Volante', progress: 82 },
        { name: 'José Peña', position: 'Defensa central', progress: 76 },
        { name: 'Erika González', position: 'Portera', progress: 92 }
      ]
    }
  },
  methods: {
    downloadReport() {
      // Aquí se podrá conectar el botón con el backend cuando esté listo.
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-dashboard {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(180deg, rgba(229, 29, 34, 0.06), rgba(255, 255, 255, 0.9));
  color: #0f172a;

  .dashboard-hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding: 24px 32px;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.08);

    h2 {
      font-size: 2.5rem;
      margin: 0.25rem 0;
      color: var(--color-text-dark);
    }

    .hero-subtitle {
      font-size: 0.9rem;
      letter-spacing: 0.4px;
      color: var(--color-text-light);
      margin: 0;
    }

    p {
      margin: 0;
    }

    .hero-pill {
      background: var(--color-primary);
      color: #fff;
      padding: 1rem 1.5rem;
      border-radius: 18px;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 600;
    }

    .pill-button {
      color: #ffffff;
      text-transform: uppercase;
      font-size: 0.75rem;
      border-color: rgba(255, 255, 255, 0.3);
      border-radius: 999px;
      padding: 6px 16px;
    }

    @media (max-width: 900px) {
      flex-direction: column;
      align-items: flex-start;

      .hero-pill {
        width: 100%;
        justify-content: space-between;
      }
    }
  }

  .dashboard-main {
    margin-top: 32px;
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }

  .dashboard-sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .sidebar-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.07);

      &__title {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        margin-bottom: 1rem;
        font-weight: 600;
        font-size: 1rem;
        color: var(--color-text-dark);

        small {
          font-weight: 400;
          color: var(--color-text-light);
        }
      }

      &.sidebar-card--athletes {
        .athlete-line {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(47, 84, 123, 0.1);
        }

        .athlete-line:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .athlete-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--color-text-light);
          strong {
            color: var(--color-text-dark);
          }
        }

        .progress-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: rgba(229, 29, 34, 0.15);
        }

        .progress-fill {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--color-primary), #ff7a7a);
        }

        .progress-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-primary);
          align-self: flex-end;
        }
      }

      .sidebar-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .el-button {
          border-radius: 14px;
          height: 44px;
          justify-content: center;
        }
      }
    }
  }

  .dashboard-charts {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .chart-row {
      .chart-card {
        background: #fff;
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      }
    }

    .chart-card {
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      padding: 22px;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        p {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        small {
          color: var(--color-text-light);
        }
      }
    }

    .chart-card--wide {
      padding-bottom: 32px;
    }

    .chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;

      .chart-card {
        height: 100%;
        min-height: 280px;
      }
    }
  }

  .chip {
    font-size: 0.75rem;
    background: rgba(229, 29, 34, 0.15);
    color: var(--color-primary);
    padding: 4px 12px;
    border-radius: 999px;
    font-weight: 700;
  }
}

@media (max-width: 768px) {
  .progress-dashboard {
    padding: 16px;

    .dashboard-sidebar {
      .sidebar-card {
        padding: 1.25rem;
      }
    }
  }
}
</style>
