/*
<!--
    ########################################
    ## @author Benjamin Thomas Schwertfeger (July 2021)
    ## copyright by Benjamin Thomas Schwertfeger (July 2021)
    ############
-->
*/

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# General functions
*/

const cumulativeSum = (
  (sum) => (value) =>
    (sum += value)
)(0);

function range(start, end, step) {
  let range = [],
    typeofStart = typeof start,
    typeofEnd = typeof end;

  if (step === 0) {
    throw TypeError("Step cannot be zero.");
  }

  if (typeofStart == "undefined" || typeofEnd == "undefined") {
    throw TypeError("Must pass start and end arguments.");
  } else if (typeofStart != typeofEnd) {
    throw TypeError("Start and end arguments must be of same type.");
  }
  typeof step == "undefined" && (step = 1);

  if (end < start) {
    step = -step;
  }
  if (typeofStart == "number") {
    while (step > 0 ? end >= start : end <= start) {
      range.push(start);
      start += step;
    }
  } else if (typeofStart == "string") {
    if (start.length != 1 || end.length != 1) {
      throw TypeError("Only strings with one character are supported.");
    }
    start = start.charCodeAt(0);
    end = end.charCodeAt(0);
    while (step > 0 ? end >= start : end <= start) {
      range.push(String.fromCharCode(start));
      start += step;
    }
  } else {
    throw TypeError("Only string and number types are supported");
  }
  return range;
}

function dynamicColors() {
  let r = Math.floor(Math.random() * 255),
    g = Math.floor(Math.random() * 255),
    b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ", 1)";
}

function poolColors(a) {
  let pool = [];
  for (let i = 0; i < a; i++) {
    pool.push(dynamicColors());
  }
  return pool;
}

function rnorm() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function transpose(m) {
  return m[0].map((x, i) => m.map((x) => x[i]));
}
/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# SETTINGS
*/

window.bm_default_input = {
  // constants
  Ca: 10,
  a: 1,
  b: 0.8,
  c: 0,
  d: -0.001,
  Nparticle: 1000, // number of particles
  T: 1000, // integration time in time units
  h: 0.5, // step size in time units
  nlines: 1,
  randomStartValue: false,
};

window.bm_active_values = {};
window.font_famliy = "Helvetica";

function driving_function(x, a, b, c, d) {
  return d * Math.pow(x, 3) + c * Math.pow(x, 2) + b * x - a;
}

function calculateBM(input = window.bm_default_input, densityAnalysis = false) {
  /*
      # ----- ---- ---- ---- Function to calculate all required values
    */
  // function f_fun(y, a, b, c, d) {
  //     return (d * Math.pow(y, 3) + c * Math.pow(y, 2) + b * y - a)
  // }
  const N = input.T / input.h;
  let t = [...new Array(N)].map((entry, index) => index * input.h),
    x = 0;

  if (!input.randomStartValue) {
    // R: x<-matrix(10,Nparticle,N) # Initial condition, all = 0
    x = [...new Array(input.Nparticle)].map(() =>
      [...new Array(N)].map(() => 10),
    );
  } else {
    // R: // #x<-matrix(rnorm(Nparticle)*10,Nparticle,N) # Initial condition,
    x = [...new Array(input.Nparticle)].map(() =>
      [...new Array(N)].map(() => rnorm() * 10),
    );
  }
  for (let row = 0; row < input.Nparticle; row++) {
    for (let i = 0; i < N - 1; i++) {
      x[row][i + 1] =
        x[row][i] +
        input.h *
          driving_function(x[row][i], input.a, input.b, input.c, input.d) +
        input.Ca * rnorm() * Math.sqrt(input.h);
    }
  }

  const xmax_rows = x.map(function (row) {
      return Math.max.apply(Math, row);
    }),
    xmin_rows = x.map(function (row) {
      return Math.min.apply(Math, row);
    });

  // const ama2 = Math.max(Math.max.apply(Math, xmax_rows), 2),
  //     ami = Math.min(Math.min.apply(Math, xmin_rows), -2);
  /* to avoid erros bc of nans */
  const ama2 = Math.max(
      ...xmin_rows.map((e) => (isNaN(e) ? Number.MIN_SAFE_INTEGER : e)),
    ),
    ami = Math.min(
      ...xmin_rows.map((e) => (isNaN(e) ? Number.MAX_SAFE_INTEGER : e)),
    );
  const ama = Math.max(ama2, -ami) / 2;

  // console.log(ama, ami, ama2)
  window.bm_active_values = {
    Ca: input.Ca,
    a: input.a,
    b: input.b,
    c: input.c,
    d: input.d,
    Nparticle: input.Nparticle,
    T: input.T,
    h: input.h,
    N: N,
    t: t,
    x: x,
    ama2: ama2,
    ami: ami,
    ama: ama,
  };

  if (densityAnalysis) {
    const bars = 40;
    let h = [...new Array(N)].map(() => [...new Array(bars)].map(() => 0)),
      hstat = [...new Array(bars)].map(() => 0), //[...new Array(N)].map(() => 0),
      bin_brakes = [...new Array(bars + 1)].map(
        (elem, index) => ((index - bars / 2) * ama) / 10,
      );

    // console.log(hstat)

    //Setup Bins
    let default_bins = [];
    for (let i = 0; i < bin_brakes.length - 1; i++) {
      default_bins.push({
        binNum: i,
        minNum: bin_brakes[i],
        maxNum: bin_brakes[i + 1],
        count: 0,
      });
    }

    // ASSIGN ALL VALUES TO THEIR BINS
    for (let step = 0; step < N; step++) {
      // loop over all timesteps
      let bins = JSON.parse(JSON.stringify(default_bins));
      for (let particle = 0; particle < input.Nparticle; particle++) {
        // loop over all particles
        let val = x[particle][step];
        for (let bin = 0; bin < bins.length; bin++) {
          let this_bin = bins[bin];
          if (val > this_bin.minNum && val <= this_bin.maxNum) {
            this_bin.count++;
            break; // An item can only be in one bin.
          }
        }
      }
      h[step] = bins.map((elem) => elem.count);
    }

    // console.log("h: ", h) // <-- HIST DATA

    for (let i = N / 2 - 1; i < N; i++) {
      for (let j = 0; j < bars; j++) {
        hstat[j] = h[i][j] + hstat[j];
      }
    }
    for (let i = 0; i < hstat.length; i++) {
      hstat[i] = (hstat[i] * 2) / input.Nparticle / N;
    }

    // console.log(hstat) // <-- HIST STATOSTIC DATA

    function table(d) {
      let table = {
        values: new Array(),
        counts: new Array(),
      };
      for (let entry = 0; entry < d.length; entry++) {
        let val = d[entry];
        if (table.values.includes(val)) {
          table.counts[table.values.indexOf(val)]++;
        } else {
          table.values.push(val);
          table.counts.push(1);
        }
      }
      let res = {
        values: table.values.sort(function (a, b) {
          return a - b;
        }),
        counts: table.counts,
      };

      for (let entry = 0; entry < table.values.length; entry++) {
        res.counts[entry] =
          table.counts[table.values.indexOf(res.values[entry])];
      }

      // console.log(res) // <-- TABLES
      return res;
    }

    // console.log(tableData)
    window.bm_active_values.dens_tableData = table(hstat);
    window.bm_active_values.h = h;
    window.bm_active_values.hstat = hstat;
    window.bm_active_values.bin_brakes = bin_brakes;
  }
  return window.bm_active_values;
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# BROWNIAN MOTION FIRST PLOTS
*/

function createBMDatasets(input) {
  /*
      # ----- ---- ---- ---- Function to create and return the datasets for the BM line and hist plot
    */
  const RESULT = calculateBM(input);

  // LINE CHART
  // R: plot(0,xlim=c(0,T),ylim=c(ami,ama),type="n")
  // R: for (i in 1:10) lines (t,x[i,],col=i)
  let BM_LINE_CHART_DATASETS = new Array();
  const LINES = input.nlines;

  // HISTOGRAM
  const bars = 40;
  const bin_brakes = [...new Array(bars + 1)].map(
    (elem, index) => ((index - bars / 2) * RESULT.ama) / 10,
  );

  // console.log(RESULT.ama)
  // console.log(bin_brakes)

  //Setup Bins
  let default_bins = [];
  for (let i = 0; i < bin_brakes.length - 1; i++) {
    default_bins.push({
      binNum: i,
      minNum: bin_brakes[i],
      maxNum: bin_brakes[i + 1],
      count: 0,
    });
  }

  // ASSIGN DATA
  for (let line = 0; line < LINES; line++) {
    // LINE CHART
    BM_LINE_CHART_DATASETS.push({
      yAxisID: "y",
      xAxisID: "x",
      data: RESULT.x[line],
      fill: false,
      borderColor: dynamicColors(), // "#A1142E",
      pointRadius: 0,
      type: "line",
      linewidth: 0.5,
    });

    // HISTOGRAM
    // Loop through data and add to bin's count
    for (let i = 0; i < RESULT.N; i++) {
      let val = RESULT.x[line][i];
      for (let j = 0; j < default_bins.length; j++) {
        let bin = default_bins[j];
        if (val > bin.minNum && val <= bin.maxNum) {
          bin.count++;
          break; // An item can only be in one bin.
        }
      }
    }
  }
  // ADD LINECHART DATASETS
  window.bm_active_values.BM_LINE_CHART_DATASETS = BM_LINE_CHART_DATASETS;

  // HISTOGRAM
  let histdata = new Array(default_bins.length),
    histlabels = new Array(default_bins.length);
  for (let i = 0; i < default_bins.length; i++) {
    histdata[i] = default_bins[i].count / RESULT.N / LINES;
    histlabels[i] = Math.round(
      (default_bins[i].minNum + default_bins[i].maxNum) / 2,
      1,
    );
  }

  const BM_HIST_CHART_DATASET = {
    type: "bar",
    label: "Density",
    labels: histlabels,
    yAxisID: "y",
    xAxisID: "x",
    data: histdata,
    backgroundColor: "orange",
    borderColor: "yellow",
    borderWidth: 1,
    borderRadius: 5,
    barPercentage: 0.5,
    barThickness: 20,
    maxBarThickness: 30,
  };

  return {
    BM_LINE_CHART_DATASETS: BM_LINE_CHART_DATASETS,
    BM_HIST_CHART_DATASET: BM_HIST_CHART_DATASET,
    values: RESULT,
  };
}

function default_BM_plots(input = window.bm_default_input) {
  /*
      # ----- ---- ---- ---- Function to create the default plots for the simple BM line and hist plot
    */
  const RESULT = createBMDatasets(input);

  // LINE CHART
  document.getElementById("bm_line_plot").remove();
  document.getElementById("bm_line_plot_container").innerHTML =
    '<canvas id="bm_line_plot"></canvas>';
  let ctx1 = document.getElementById("bm_line_plot");
  const config1 = {
    type: "line",
    data: {
      labels: RESULT.values.t,
      datasets: RESULT.BM_LINE_CHART_DATASETS,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Brownian motion",
          font: {
            Family: window.font_famliy,
            size: 18,
          },
        },
        legend: {
          position: "top",
          display: false,
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            labelPointStyle: function (context) {
              return {
                pointStyle: "rectRot",
                rotation: 0,
              };
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "t",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
      },
      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverRadius: 8,
      hoverBackgroundColor: "yellow",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.bm_line_plot = new Chart(ctx1, config1);

  // HISTOGRAM
  document.getElementById("bm_hist_plot").remove();
  document.getElementById("bm_hist_plot_container").innerHTML =
    '<canvas id="bm_hist_plot"></canvas>';
  let ctx2 = document.getElementById("bm_hist_plot");
  const config2 = {
    type: "bar",
    data: {
      labels: RESULT.BM_HIST_CHART_DATASET.labels,
      datasets: [RESULT.BM_HIST_CHART_DATASET],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Histogram",
          font: {
            Family: window.font_famliy,
            size: 18,
          },
        },
        legend: {
          position: "top",
          display: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Density",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
      },
      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverBackgroundColor: "yellow",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.bm_hist_plot = new Chart(ctx2, config2);
}

function updateBM_plots(input) {
  /*
      # ----- ---- ---- ---- Function to update the simple BM line and hist plot after input
    */
  let line_chart = window.bm_line_plot,
    hist_chart = window.bm_hist_plot,
    values = JSON.parse(JSON.stringify(window.bm_default_input));

  (values.T = input.T),
    (values.Ca = input.Ca),
    (values.nlines = input.nlines),
    (values.randomStartValue = input.randomStartValue);

  const RESULT = createBMDatasets(values);

  (line_chart.data.labels = RESULT.values.t),
    (line_chart.data.datasets = RESULT.BM_LINE_CHART_DATASETS);
  line_chart.update();

  (hist_chart.data.labels = RESULT.BM_HIST_CHART_DATASET.labels),
    (hist_chart.data.datasets = [RESULT.BM_HIST_CHART_DATASET]);
  hist_chart.update();
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# BM DENSITY ANALYSIS
*/

(window.bm_dens_line_1of6 = {}),
  (window.bm_dens_line_1of6 = {}),
  (window.bm_dens_line_3of6 = {}),
  (window.bm_dens_line_4of6 = {}),
  (window.bm_dens_line_5of6 = {}),
  (window.bm_dens_line_6of6 = {});

window.contour_plot_layout = {
  title: {
    text: "i) Density over time and space",
    font: {
      family: window.font_famliy,
      size: 18,
    },
    xref: "paper",
    x: 0.05,
  },
  xaxis: {
    title: {
      text: "time",
      font: {
        family: font_famliy,
        size: 18,
        color: "#7f7f7f",
      },
    },
  },
  yaxis: {
    title: {
      text: "space",
      font: {
        family: font_famliy,
        size: 18,
        color: "#7f7f7f",
      },
    },
  },
};

window.contour_plot_config = {
  toImageButtonOptions: {
    format: "svg",
    filename: "contour_plot",
    width: 1920,
    height: 1080,
    scale: 1,
  },
};

function createBM_density_Datasets(input) {
  /*
      # ----- ---- ---- ---- Function to create and return datasets for the density analysis plots
    */

  const RESULT = calculateBM(input, (densityAnalysis = true));
  const bar_bg_color = "rgb(255, 165, 0,0.5)",
    bar_border_color = "rgb(255, 255, 0, 0.5)";
  // LINE CHART DATA
  const BM_DENSE_LINE_CHART_DATASETS = [
    {
      yAxisID: "y",
      xAxisID: "x",
      data: RESULT.hstat,
      fill: false,
      borderColor: "orange",
      pointRadius: 0,
      type: "line",
      linewidth: 1,
      order: 0,
    },
    {
      yAxisID: "y",
      xAxisID: "x",
      data: RESULT.hstat,
      borderColor: bar_border_color,
      backgroundColor: bar_bg_color,
      borderWidth: 1,
      borderRadius: 3,
      type: "bar",
      oder: 1,
    },
  ];

  // TABLE CHART DATA
  let tableData = RESULT.dens_tableData,
    BM_DENS_TABLE_CHART_DATASETS = new Array();
  for (let entry = 0; entry < tableData.counts.length; entry++) {
    BM_DENS_TABLE_CHART_DATASETS.push({
      data: [
        {
          x: tableData.values[entry],
          y: 0,
        },
        {
          x: tableData.values[entry],
          y: tableData.counts[entry],
        },
      ],
      backgroundColor: "red",
      showLine: true,
      pointRadius: 0,
      borderColor: "red",
    });
  }
  const six_data_arrays = [
    [...new Array(RESULT.h[0].length)].map(
      (elem, index) => RESULT.h[0][index] / RESULT.Nparticle,
    ),
    [...new Array(RESULT.h[0].length)].map(
      (elem, index) => RESULT.h[1][index] / RESULT.Nparticle,
    ),
    [...new Array(RESULT.h[0].length)].map(
      (elem, index) => RESULT.h[3][index] / RESULT.Nparticle,
    ),
    [...new Array(RESULT.h[0].length)].map(
      (elem, index) => RESULT.h[7][index] / RESULT.Nparticle,
    ),
    [...new Array(RESULT.h[0].length)].map(
      (elem, index) => RESULT.h[RESULT.N / 2 - 1][index] / RESULT.Nparticle,
    ),
    [...new Array(RESULT.h[0].length)].map(
      (elem, index) =>
        (RESULT.h[RESULT.N - 1][index] + RESULT.h[RESULT.N - 2][index]) /
        RESULT.Nparticle /
        2,
    ),
  ];
  const SIX_DATASETS = [...new Array(six_data_arrays.length)].map(
    (elem, index) => [
      {
        data: six_data_arrays[index],
      },
      {
        data: six_data_arrays[index],
      },
    ],
  );

  for (let dataset = 0; dataset < SIX_DATASETS.length; dataset++) {
    (SIX_DATASETS[dataset][0].borderColor = bar_border_color),
      (SIX_DATASETS[dataset][0].backgroundColor = bar_bg_color),
      (SIX_DATASETS[dataset][0].type = "bar"),
      (SIX_DATASETS[dataset][0].borderWidth = 1),
      (SIX_DATASETS[dataset][0].borderRadius = 3),
      (SIX_DATASETS[dataset][0].order = 1);

    (SIX_DATASETS[dataset][1].type = "line"),
      (SIX_DATASETS[dataset][1].linewidth = 1),
      (SIX_DATASETS[dataset][1].pointRadius = 1),
      (SIX_DATASETS[dataset][1].borderColor = "orange"),
      (SIX_DATASETS[dataset][1].order = 0),
      (SIX_DATASETS[dataset][1].fill = false);

    for (let i = 0; i < SIX_DATASETS[dataset].length; i++) {
      (SIX_DATASETS[dataset][i].yAxisID = "y"),
        (SIX_DATASETS[dataset][i].xAxisID = "x");
    }
  }

  /* CONTOUR PLOT
    # in R: > filled.contour(t,(-19:20)*ama/10-ama/20,h,color.palette=rainbow,xlab="time",ylab="space")
    # x.length = h[0].length = 40 bars (default)
    */
  const contour_plot_data = [
    {
      z: transpose(RESULT.h),
      x: [...new Array(RESULT.N)].map((elem, index) => index / 2),
      y: [...new Array(RESULT.h[0].length)].map(
        (elem, index) => ((index - 19) * RESULT.ama) / 10 - RESULT.ama / 20,
      ),
      type: "contour",
      colorscale: "Jet",
      // line: {
      //     smoothing: 0.85
      // },
      autocontour: false,
      colorbar: {
        title: "density",
        // tickvals:[-250,-,50,100],
        tickfont: {
          color: "black",
        },
      },
      contours: {
        start: -250,
        end: 250,
        size: 25,
      },
    },
  ];
  const LABELS = [...new Array(RESULT.bin_brakes.length - 1)].map(
    (elem, index) => Math.round(RESULT.bin_brakes[index]),
  );

  return {
    BM_DENSE_LINE_CHART_DATASETS: BM_DENSE_LINE_CHART_DATASETS,
    LABELS: LABELS,
    t: RESULT.t,
    BM_DENS_TABLE_CHART_DATASETS: BM_DENS_TABLE_CHART_DATASETS,
    tableTicks: tableData.values,
    SIX_DATASETS: SIX_DATASETS,
    contour_plot_data: contour_plot_data,
    bin_brakes: RESULT.bin_brakes,
  };
}

function default_BM_dens_plots(input = window.bm_default_input) {
  /*
      # ----- ---- ---- ---- Function to plot the default DENSITY ANALYSIS plots
    */
  const RESULT = createBM_density_Datasets(input);

  // LINE PLOT
  document.getElementById("bm_dens_line_plot_container").innerHTML =
    '<canvas id="bm_dens_line_plot"></canvas>';
  let ctx1 = document.getElementById("bm_dens_line_plot");
  const config1 = {
    type: "bar",
    data: {
      labels: RESULT.LABELS,
      datasets: RESULT.BM_DENSE_LINE_CHART_DATASETS,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "a)",
          font: {
            Family: window.font_famliy,
            size: 16,
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "value",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "hstat[]",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
      },
      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverRadius: 6,
      hoverBackgroundColor: "yellow",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.bm_dens_line_plot = new Chart(ctx1, config1);

  // TABLE PLOT
  document.getElementById("bm_dens_table_plot_container").innerHTML =
    '<canvas id="bm_dens_table_plot"></canvas>';
  let ctx2 = document.getElementById("bm_dens_table_plot");
  // const ticks = RESULT.tableTicks;
  const config2 = {
    type: "scatter",
    data: {
      datasets: RESULT.BM_DENS_TABLE_CHART_DATASETS,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "b)",
          font: {
            Family: window.font_famliy,
            size: 16,
          },
        },
        legend: {
          position: "top",
          display: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "value",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
          ticks: {
            // min: ticks[0],
            // max: ticks[ticks.length - 1],

            // forces step size to be 5 units
            stepSize: 0.01, // <----- This prop sets the stepSize
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Density",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
      },
      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverRadius: 2,
      hoverBackgroundColor: "red",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.bm_dens_table_plot = new Chart(ctx2, config2);

  // NOW THESE SIX PLOTS
  const SIX_container_ids = [
      "bm_line_1_plot_container",
      "bm_line_2_plot_container",
      "bm_line_3_plot_container",
      "bm_line_4_plot_container",
      "bm_line_5_plot_container",
      "bm_line_6_plot_container",
    ],
    SIX_plot_ids = [
      "bm_line_1_plot",
      "bm_line_2_plot",
      "bm_line_3_plot",
      "bm_line_4_plot",
      "bm_line_5_plot",
      "bm_line_6_plot",
    ],
    yLabels = [
      "h[1,]/Nparticle",
      "h[2,]/Nparticle",
      "h[4,]/Nparticle",
      "h[8,]/Nparticle",
      "h[N/2,]/Nparticle",
      "(h[N-1,]+h[N-2,])/Nparticle/2",
    ],
    titles = ["c) ", "d) ", "e) ", "f) ", "g) ", "h) "];
  let six_charts = new Array(RESULT.SIX_DATASETS.length);

  for (let entry = 0; entry < RESULT.SIX_DATASETS.length; entry++) {
    document.getElementById(SIX_container_ids[entry]).innerHTML =
      '<canvas id="' + SIX_plot_ids[entry] + '"></canvas>';
    const ctx = document.getElementById(SIX_plot_ids[entry]),
      config = {
        type: "bar",
        data: {
          labels: RESULT.LABELS,
          datasets: RESULT.SIX_DATASETS[entry],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          // elements: {
          //     line: {
          //         tension: 0.1,
          //     },
          // },
          plugins: {
            title: {
              display: true,
              text: titles[entry],
              font: {
                Family: window.font_famliy,
                size: 16,
              },
            },
            legend: {
              position: "top",
              display: false,
            },
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: "value",
                font: {
                  family: window.font_famliy,
                  size: 14,
                },
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: yLabels[entry],
                font: {
                  family: window.font_famliy,
                  size: 14,
                },
              },
            },
          },
          animations: {
            radius: {
              duration: 400,
              easing: "linear",
              loop: (ctx) => ctx.activate,
            },
          },
          hoverRadius: 6,
          hoverBackgroundColor: "yellow",
          interaction: {
            mode: "nearest",
            intersect: false,
            axis: "x",
          },
        },
      };

    six_charts[entry] = new Chart(ctx, config);
  }
  (window.bm_dens_line_1of6 = six_charts[0]),
    (window.bm_dens_line_2of6 = six_charts[1]),
    (window.bm_dens_line_3of6 = six_charts[2]),
    (window.bm_dens_line_4of6 = six_charts[3]),
    (window.bm_dens_line_5of6 = six_charts[4]),
    (window.bm_dens_line_6of6 = six_charts[5]);

  // NOW THE CONTOUR PLOT
  Plotly.newPlot(
    "contour_plot",
    RESULT.contour_plot_data,
    window.contour_plot_layout,
    window.contour_plot_config,
  );
}

function updateBM_dens_plots(input) {
  /*
      # ----- ---- ---- ---- Function to update DENSITY ANALYSIS plots after input
    */
  let values = JSON.parse(JSON.stringify(window.bm_default_input));
  (values.T = parseInt(input.T)),
    (values.Ca = parseFloat(input.Ca)),
    (values.randomStartValue = input.randomStartValue);

  const RESULT = createBM_density_Datasets(values);

  let line_chart = window.bm_dens_line_plot;
  //line_chart.data.labels = RESULT.LABELS; //[...new Array(RESULT.BM_DENSE_LINE_CHART_DATASET.data.length)].map((elem, i) => i);;
  line_chart.data.datasets = RESULT.BM_DENSE_LINE_CHART_DATASETS;
  line_chart.update();

  let table_chart = window.bm_dens_table_plot;
  table_chart.data.datasets = RESULT.BM_DENS_TABLE_CHART_DATASETS;
  table_chart.update();

  let six_charts = [
    window.bm_dens_line_1of6,
    window.bm_dens_line_2of6,
    window.bm_dens_line_3of6,
    window.bm_dens_line_4of6,
    window.bm_dens_line_5of6,
    window.bm_dens_line_6of6,
  ];

  for (let entry = 0; entry < six_charts.length; entry++) {
    let chart = six_charts[entry];
    chart.data.datasets = RESULT.SIX_DATASETS[entry];
    chart.update();
  }

  // CONTOUR PLOT
  Plotly.newPlot(
    "contour_plot",
    RESULT.contour_plot_data,
    window.contour_plot_layout,
    window.contour_plot_config,
  );
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# DRIVING FUNCTION
*/

function integrierte_driving_function(x, b, c, d) {
  return -(
    (d / 4) * Math.pow(x, 4) +
    (c / 3) * Math.pow(x, 3) +
    (b / 2) * Math.pow(x, 2) -
    x
  );
}

function create_DF_dataset(input = window.bm_default_input) {
  const len = 240;
  const xVals = [...new Array(len)].map((e, i) => i - len / 2);
  const driving_function_yVals = [...new Array(len)].map((e, i) =>
    driving_function(xVals[i], input.a, input.b, input.c, input.d),
  );

  let positiveP = new Array(),
    negativeP = new Array();
  for (let point = 0; point < driving_function_yVals.length; point++) {
    if (driving_function_yVals[point] > 0) {
      positiveP.push({
        x: xVals[point],
        y: driving_function_yVals[point],
      });
    } else if (driving_function_yVals[point] < 0) {
      negativeP.push({
        x: xVals[point],
        y: driving_function_yVals[point],
      });
    }
  }

  const DATASETS = [
    {
      /* positive points */
      label: "f(x) > 0",
      xAxisID: "x",
      yAxisID: "y",
      data: positiveP,
      fill: false,
      backgroundColor: "rgb(0,255,0,.7)",
      pointRadius: 2,
      type: "scatter",
    },
    {
      /* negative points */
      label: "f(x) < 0",
      xAxisID: "x",
      yAxisID: "y",
      data: negativeP,
      fill: false,
      backgroundColor: "rgb(255,0,0,.7)",
      pointRadius: 2,
      type: "scatter",
    },
    {
      label: "f(x)",
      xAxisID: "x",
      yAxisID: "y",
      data: driving_function_yVals,
      fill: false,
      borderColor: "black",
      pointRadius: 0,
      type: "line",
      linewidth: 1,
    },
    {
      label: "-F(x)",
      xAxisID: "x",
      yAxisID: "y",
      data: [...new Array(len)].map((e, i) =>
        integrierte_driving_function(xVals[i], input.b, input.c, input.d),
      ),
      fill: false,
      borderColor: "blue",
      pointRadius: 0,
      type: "line",
      linewidth: 1,
    },
  ];

  return {
    labels: xVals,
    datasets: DATASETS,
  };
}

function default_DF_plot(input = window.bm_default_input) {
  /*
    # ----- ---- ---- ---- Function to create the default plots for the driving function
    */

  const RESULT = create_DF_dataset(input);
  document.getElementById("df_plot").remove();
  document.getElementById("df_plot_container").innerHTML =
    '<canvas id="df_plot"></canvas>';
  let ctx = document.getElementById("df_plot");
  const config = {
    type: "line",
    data: {
      labels: RESULT.labels,
      datasets: RESULT.datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Driving function",
          font: {
            Family: window.font_famliy,
            size: 18,
          },
        },
        legend: {
          position: "top",
          display: true,
          labels: {
            font: {
              Family: "Times New Roman",
              style: "italic",
              // size: 14,
            },
          },
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            labelPointStyle: function (context) {
              return {
                pointStyle: "rectRot",
                rotation: 0,
              };
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "x",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
          min: -58,
          max: 58,
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
          min: -200,
          max: 200,
        },
      },

      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverRadius: 6,
      hoverBackgroundColor: "yellow",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.df_plot = new Chart(ctx, config);
}

function update_DF_plot(input) {
  const RESULT = create_DF_dataset(input);
  window.df_plot.data.datasets = RESULT.datasets;
  window.df_plot.update();
}

/*
# ==============================================================================
# ==============================================================================
# === wohin bewegt sich ein Partikel wenn er an Punk ... ist ?
*/

window.df_X_line_plot = {};
window.default_input_X = {
  y0: 1.25,
  h: 0.01,
  N: 2000,
  a: 1,
  b: 0.8,
  c: 0,
  d: -0.001,
};

function computeX(input = window.default_input_X) {
  let y = new Array(input.N).fill(0);
  y[0] = input.y0;
  for (let i = 1; i < input.N; i++) {
    y[i] =
      y[i - 1] +
      input.h * driving_function(y[i - 1], input.a, input.b, input.c, input.d);
  }
  return {
    y: y,
  };
}

function createDatasetofX(input = window.default_input_X) {
  const RESULT = computeX(input);
  return {
    DATASETS: [
      {
        label: "movement to stable condition",
        xAxisID: "x",
        yAxisID: "y",
        data: RESULT.y,
        fill: false,
        borderColor: "black",
        pointRadius: 0,
        type: "line",
        linewidth: 1,
      },
    ],
    LABELS: [...new Array(input.N)].map(
      (e, i) => Math.round((i * input.h + Number.EPSILON) * 100) / 100,
    ),
  };
}

function defaultPointMovementPlot() {
  const RESULT = createDatasetofX();

  document.getElementById("df_X-plot_container").innerHTML =
    '<canvas id="df_X_plot"></canvas>';
  let ctx = document.getElementById("df_X_plot");
  const config = {
    type: "line",
    data: {
      labels: RESULT.LABELS,
      datasets: RESULT.DATASETS,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Particle movement",
          font: {
            Family: window.font_famliy,
            size: 16,
          },
        },
        legend: {
          display: true,
        },
        tooltip: {
          usePointStyle: true,

          callbacks: {
            labelPointStyle: function (context) {
              return {
                pointStyle: "rectRot",
                rotation: 0,
              };
            },
            label: function (context) {
              let label = "x";

              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "time",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "x",
            font: {
              family: window.font_famliy,
              size: 16,
            },
          },
        },
      },
      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverRadius: 6,
      hoverBackgroundColor: "yellow",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.df_X_line_plot = new Chart(ctx, config);
}

function updatePointMovementPLot(input) {
  const RESULT = createDatasetofX(input);

  (window.df_X_line_plot.data.datasets = RESULT.DATASETS),
    (window.df_X_line_plot.data.labels = RESULT.LABELS);
  window.df_X_line_plot.update();
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# GENERAL
*/

window.onload = function init() {
  default_BM_plots();
  default_BM_dens_plots();
  default_DF_plot();
  defaultPointMovementPlot();
};
