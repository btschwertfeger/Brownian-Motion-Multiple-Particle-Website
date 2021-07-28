/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// BROWNIAN MOTION
*/
const bm_b_slide = document.getElementById('bm_d_slide'),
    bm_T_slide = document.getElementById('bm_T_slide'),
    bm_n_slide = document.getElementById('bm_nlines_slide'),
    bm_SLIDER = document.getElementsByName('bm_slide'),
    bm_value_fields = document.getElementsByName('bm_slide_value'),
    bm_plot_variables = ["d", "T", "nlines"];

const bm_RESET_BTN = document.getElementById('bm_resetBtn');
bm_RESET_BTN.onclick = function () {
    window.default_BM_plots(); // resets the plot
    bm_SLIDER.forEach((element, index) => { // reset the sliders
        const default_value = window.bm_default_input[bm_plot_variables[index]];
        document.getElementById(element.id).value = default_value;
    });
    bm_value_fields.forEach((element, index) => { // Reset value fields
        const default_value = window.bm_default_input[bm_plot_variables[index]];
        document.getElementById(element.id).innerHTML = default_value;
    });
}

const bm_AGAIN_BTN = document.getElementById('bm_againBtn');
bm_AGAIN_BTN.onclick = function () {
    window.updateBM_plots({
        d: document.getElementById("bm_d_slide").value,
        T: document.getElementById("bm_T_slide").value,
        nlines: document.getElementById("bm_nlines_slide").value,
    });
}

for (let entry = 0; entry < bm_SLIDER.length; entry++) {
    bm_SLIDER[entry].oninput = function () {
        let elem_id = bm_SLIDER[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(bm_SLIDER[entry].id).value;
    }
    bm_SLIDER[entry].onchange = function () {
        window.updateBM_plots({
            d: document.getElementById("bm_d_slide").value,
            T: document.getElementById("bm_T_slide").value,
            nlines: document.getElementById("bm_nlines_slide").value,
        });
    }
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================


const random_walks_n_slide = document.getElementById('random_walks_n_slide'),
    random_walks_nstep_slide = document.getElementById('random_walks_nsteps_slide'),
    random_walks_SLIDER = document.getElementsByName('1drandomslider'),
    random_walks_value_fields = document.getElementsByName('random_walks_slide_value'),
    random_walks_plot_variables = ["n", "nsteps"];

const random_walks_RESET_BTN = document.getElementById('random_walks_resetBtn');
random_walks_RESET_BTN.onclick = function () {
    window.plotRandomGraphs(); // resets the plot
    random_walks_SLIDER.forEach((element, index) => { // reset the sliders
        const default_value = window.random_walks_defaultInput[random_walks_plot_variables[index]];
        document.getElementById(element.id).value = default_value;
    });
    random_walks_value_fields.forEach((element, index) => { // Reset value fields
        const default_value = window.random_walks_defaultInput[random_walks_plot_variables[index]];
        document.getElementById(element.id).innerHTML = default_value;
    });

}

const random_walks_PLOT_AGAIN_BTN = document.getElementById('random_walks_plotAgainBtn');
random_walks_PLOT_AGAIN_BTN.onclick = function () {
    window.plotRandomGraphs({
        n: document.getElementById('random_walks_n_slide').value,
        nsteps: document.getElementById('random_walks_nsteps_slide').value,
    });
}

for (let entry = 0; entry < random_walks_SLIDER.length; entry++) {
    random_walks_SLIDER[entry].oninput = function () {
        let elem_id = random_walks_SLIDER[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(random_walks_SLIDER[entry].id).value;
    }
    random_walks_SLIDER[entry].onchange = function () {
        window.plotRandomGraphs({
            n: document.getElementById('random_walks_n_slide').value,
            nsteps: document.getElementById('random_walks_nsteps_slide').value,
        });
    }
}

# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================


const randomwalk2d_goBtn = document.getElementById('random_walks2d_goBtn'),
    randomwalk2d_stepBtn = document.getElementById('random_walks2d_stepBtn'),
    randomwalk2d_stopBtn = document.getElementById('random_walks2d_stopBtn'),
    randomwalk2d_againBtn = document.getElementById('random_walks2d_againBtn'),
    randomwalk2d_resetBtn = document.getElementById('random_walks2d_resetBtn');

randomwalk2d_goBtn.onclick = function () {
    clearInterval(window.do_2dRandomWalkintervalId);
    window.do_2dRandomWalk();
}

randomwalk2d_stepBtn.onclick = function () {
    window.update2DRandomWalkPlot();
}

randomwalk2d_stopBtn.onclick = function () {
    clearInterval(window.do_2dRandomWalkintervalId);
}

randomwalk2d_againBtn.onclick = function () {
    document.getElementById('random_walks2d_resetBtn').click();
    document.getElementById('random_walks2d_goBtn').click();

}

randomwalk2d_resetBtn.onclick = function () {
    clearInterval(window.do_2dRandomWalkintervalId);
    window.plot_default_2DRandomWalk();
}



# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================



const ddiff_goBtn = document.getElementById('ddiff_goBtn');
const ddiff_stepBtn = document.getElementById('ddiff_stepBtn');
const ddiff_stopBtn = document.getElementById('ddiff_stopBtn');
const ddiff_resetBtn = document.getElementById('ddiff_resetBtn');

ddiff_goBtn.onclick = function () {
    clearInterval(window.do2ddiffintervalId);
    window.do2ddiff();
}

ddiff_stepBtn.onclick = function () {
    window.update2ddiffPlot();
}

ddiff_stopBtn.onclick = function () {
    clearInterval(window.do2ddiffintervalId);
}

ddiff_resetBtn.onclick = function () {
    clearInterval(window.do2ddiffintervalId);
    window.do2diff_default();
}
*/