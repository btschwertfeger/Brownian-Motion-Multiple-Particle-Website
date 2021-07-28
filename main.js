/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// General functions
*/

const cumulativeSum = (sum => value => sum += value)(0);

function range(start, end, step) {
    var range = [];
    var typeofStart = typeof start;
    var typeofEnd = typeof end;

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
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return "rgba(" + r + "," + g + "," + b + ", 0.5)";
}

function poolColors(a) {
    let pool = [];
    for (let i = 0; i < a; i++) {
        pool.push(dynamicColors());
    }
    return pool;
}

function rnorm() {
    var u = 0,
        v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
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
    T: 500, //500 integration time in time units
    h: 0.5, //step size in time units
    nlines: 5,
}

window.bm_active_values = {};

function calculateBM(input = window.bm_default_input, densityAnalysis = false) {
    function f_fun(y, a, b, c, d) {
        return (d * Math.pow(y, 3) + c * Math.pow(y, 2) + b * y - a)
    }

    let N = input.T / input.h
    let t = [...new Array(N)].map((entry, index) => index * input.h)

    // R: x<-matrix(10,Nparticle,N) # Initial condition, all = 0
    let x = [...new Array(input.Nparticle)].map(() => [...new Array(N)].map(() => 10))
    // OR 
    // R: // #x<-matrix(rnorm(Nparticle)*10,Nparticle,N) # Initial condition,
    //let x = [...new Array(input.Nparticle)].map(() => [...new Array(N)].map(() => rnorm() * 10))

    for (let row = 0; row < input.Nparticle; row++) {
        for (let i = 0; i < N - 1; i++) {
            x[row][i + 1] = x[row][i] + input.h * f_fun(x[row][i], input.a, input.b, input.c, input.d) + input.Ca * rnorm() * Math.sqrt(input.h);
        }
    }

    const xmax_rows = x.map(function (row) {
            return Math.max.apply(Math, row);
        }),
        xmin_rows = x.map(function (row) {
            return Math.min.apply(Math, row);
        });

    const ama2 = Math.max(Math.max.apply(Math, xmax_rows), 2),
        ami = Math.min(Math.min.apply(Math, xmin_rows), -2),
        ama = Math.max(ama2, -ami);

    // console.log(ama2, ami, ama, x)

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
    }

    if (densityAnalysis) {
        const bars = 40
        let h = [...new Array(N)].map(() => [...new Array(bars)].map(() => 0)),
            hstat = [...new Array(N)].map(() => 0),
            bin_brakes = [...new Array(bars + 1)].map((elem, index) => (index - bars / 2) * ama / 10);

        //Setup Bins
        let default_bins = []
        for (let i = 0; i < bin_brakes.length - 1; i++) {
            default_bins.push({
                binNum: i,
                minNum: bin_brakes[i],
                maxNum: bin_brakes[i + 1],
                count: 0
            })
        }

        // ASSIGN ALL VALUES TO THEIR BINS
        for (let line = 0; line < N; line++) {
            let bins = JSON.parse(JSON.stringify(default_bins));

            // Loop through data and add to bin's count
            for (let i = 0; i < x.length; i++) {
                // console.log(x[line][i])
                let val = x[i][line];
                for (let j = 0; j < bins.length; j++) {
                    let bin = bins[j];
                    if (val > bin.minNum && val <= bin.maxNum) {
                        bin.count++;
                        break; // An item can only be in one bin.
                    }
                }
            }
            h[line] = bins.map((elem) => elem.count);
        }
        // console.log(h)
        for (let i = N / 2; i < N; i++) {
            for (let j = 0, hstat_idx = 0; hstat_idx < N; hstat_idx++, j++) {
                if (j == bars) {
                    j = 0;
                }
                hstat[hstat_idx] = h[i][j] + hstat[hstat_idx];
            }
        }
        for (let i = 0; i < hstat.length; i++) {
            hstat[i] = hstat[i] * 2 / input.Nparticle / N;
        }

        // console.log(hstat)
        window.bm_active_values.h = h;
        window.bm_active_values.hstat = hstat;
    }


    return window.bm_active_values;
}


/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
# BROWNIAN MOTION
*/


function createBMDatasets(input) {
    const RESULT = calculateBM(input);

    // LINE CHART
    // R: plot(0,xlim=c(0,T),ylim=c(ami,ama),type="n")
    // R: for (i in 1:10) lines (t,x[i,],col=i)
    let BM_LINE_CHART_DATASETS = new Array();
    const LINES = input.nlines;

    // HISTOGRAM
    const ymin = RESULT.ami,
        ymax = RESULT.ama;
    const interval = 1 //(ymax + ymin) / 25;

    let bins = [],
        binCount = 0;

    //Setup Bins
    for (var i = ymin; i < ymax; i += interval) {
        bins.push({
            binNum: binCount,
            minNum: i,
            maxNum: i + interval,
            count: 0
        })
        binCount++;
    }

    // ASSIGN DATA
    for (let line = 0; line < LINES; line++) {

        // LINE CHART
        BM_LINE_CHART_DATASETS.push({
            yAxisID: 'y',
            xAxisID: 'x',
            data: RESULT.x[line],
            fill: false,
            borderColor: dynamicColors(),
            pointRadius: 0,
            type: 'line',
            linewidth: .5,
        })

        // HISTOGRAM
        //Loop through data and add to bin's count
        for (let i = 0; i < RESULT.N; i++) {
            let val = RESULT.x[line][i];
            for (let j = 0; j < bins.length; j++) {
                let bin = bins[j];
                if (val > bin.minNum && val <= bin.maxNum) {
                    bin.count++;
                    break; // An item can only be in one bin.
                }
            }
        }
    }
    // console.log(bins)
    // ADD LINECHART DATASETS
    window.bm_active_values.BM_LINE_CHART_DATASETS = BM_LINE_CHART_DATASETS;

    // HISTOGRAM
    let histdata = new Array(bins.length),
        histlabels = new Array(bins.length);
    for (let i = 0; i < bins.length; i++) {
        histdata[i] = bins[i].count;
        histlabels[i] = Math.round((bins[i].minNum + bins[i].maxNum) / 2, 1)
    }

    const BM_HIST_CHART_DATASET = {
        type: 'bar',
        label: 'Density',
        labels: histlabels,
        yAxisID: 'y',
        xAxisID: 'x',
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
    }
}

function default_BM_plots(input = window.bm_default_input) {
    const RESULT = createBMDatasets(input);

    // LINE CHART
    document.getElementById('bm_line_plot').remove();
    document.getElementById('bm_line_plot_container').innerHTML = '<canvas id="bm_line_plot"></canvas>';
    let ctx1 = document.getElementById('bm_line_plot');
    const config1 = {
        type: 'line',
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
                    text: 'Brownian motion',
                    font: {
                        Family: 'Helvetica',
                        size: 18
                    }
                },
                legend: {
                    position: 'top',
                    display: false,
                },
                // zoom: {
                //     zoom: {
                //         wheel: {
                //             enabled: true,
                //         },
                //         pinch: {
                //             enabled: true,
                //         },
                //         mode: 'x',
                //     }
                // }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 't',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        }
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: 'Helvetica',
                            size: 16
                        },
                    },
                },
            },

            animations: {
                radius: {
                    duration: 400,
                    easing: 'linear',
                    loop: (ctx) => ctx.activate
                }
            },
            hoverRadius: 8,
            hoverBackgroundColor: 'yellow',
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            }
        }
    };
    window.bm_line_plot = new Chart(ctx1, config1);

    // HISTOGRAM
    document.getElementById('bm_hist_plot').remove();
    document.getElementById('bm_hist_plot_container').innerHTML = '<canvas id="bm_hist_plot"></canvas>';
    let ctx2 = document.getElementById('bm_hist_plot');
    const config2 = {
        type: 'bar',
        data: {
            labels: RESULT.BM_HIST_CHART_DATASET.labels,
            datasets: [
                RESULT.BM_HIST_CHART_DATASET,
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Histogram',
                    font: {
                        Family: 'Helvetica',
                        size: 18
                    }
                },
                legend: {
                    position: 'top',
                    display: false,
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        }
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Density',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        },
                    },
                },
            },
            animations: {
                radius: {
                    duration: 400,
                    easing: 'linear',
                    loop: (ctx) => ctx.activate
                }
            },
            hoverBackgroundColor: 'yellow',
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            }
        }
    };
    window.bm_hist_plot = new Chart(ctx2, config2);
}

function updateBM_plots(input) {
    // this updates the plot with new values from slider input
    let line_chart = window.bm_line_plot;
    let hist_chart = window.bm_hist_plot;
    let values = JSON.parse(JSON.stringify(window.bm_default_input));
    values.T = input.T;
    values.d = input.d;
    values.nlines = input.nlines;

    const RESULT = createBMDatasets(values);

    line_chart.data.labels = RESULT.values.t;
    line_chart.data.datasets = RESULT.BM_LINE_CHART_DATASETS;
    line_chart.update()

    hist_chart.data.labels = RESULT.BM_HIST_CHART_DATASET.labels;
    hist_chart.data.datasets = [RESULT.BM_HIST_CHART_DATASET];
    hist_chart.update()
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
# DENSITY ANALYSIS
*/

function createBM_density_Datasets(input) {
    const RESULT = calculateBM(input, densityAnalysis = true);
    return {
        BM_DENSE_LINE_CHART_DATASET: {
            yAxisID: 'y',
            xAxisID: 'x',
            data: RESULT.hstat,
            fill: false,
            borderColor: dynamicColors(),
            pointRadius: 0,
            type: 'line',
            linewidth: 1,
        },
        t: RESULT.t,
    }
}

function default_BM_dens_plots(input = window.bm_default_input) {
    /*
      # ----- ---- ---- ---- DENSITY ANALYSIS
      */
    const RESULT = createBM_density_Datasets(input)
    console.log(RESULT.t)
    document.getElementById('bm_dens_line_plot').remove();
    document.getElementById('bm_dens_line_plot_container').innerHTML = '<canvas id="bm_dens_line_plot"></canvas>';
    let ctx1 = document.getElementById('bm_dens_line_plot');
    const config1 = {
        type: 'line',
        data: {
            labels: RESULT.t,
            datasets: [RESULT.BM_DENSE_LINE_CHART_DATASET],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '???',
                    font: {
                        Family: 'Helvetica',
                        size: 18
                    }
                },
                legend: {
                    position: 'top',
                    display: false,
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 't',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        }
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: 'Helvetica',
                            size: 16
                        },
                    },
                },
            },

            animations: {
                radius: {
                    duration: 400,
                    easing: 'linear',
                    loop: (ctx) => ctx.activate
                }
            },
            hoverRadius: 8,
            hoverBackgroundColor: 'yellow',
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            }
        }
    };
    window.bm_dens_line_plot = new Chart(ctx1, config1);

}
/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
# GENERAL
*/
function init() {
    default_BM_plots();
    default_BM_dens_plots();
}
window.onload = init();