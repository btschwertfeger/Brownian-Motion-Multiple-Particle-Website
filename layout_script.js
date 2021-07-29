/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// BROWNIAN MOTION FIRST LINE AND HIST PLOT SETTINGS
*/

const bm_d_slide = document.getElementById('bm_d_slide'),
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
        d: bm_d_slide.value,
        T: bm_T_slide.value,
        nlines: bm_n_slide.value,
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
            d: bm_d_slide.value,
            T: bm_T_slide.value,
            nlines: bm_n_slide.value,
        });
    }
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// BROWNIAN MOTION SECOND LINE AND HIST PLOT SETTINGS
*/


const bm_dens_d_slide = document.getElementById('bm_dens_d_slide'),
    bm_dens_T_slide = document.getElementById('bm_dens_T_slide'),
    bm_dens_SLIDER = document.getElementsByName('bm_dens_slide'),
    bm_dens_value_fields = document.getElementsByName('bm_dens_slide_value'),
    bm_dens_plot_variables = ["d", "T"];

const bm_dens_RESET_BTN = document.getElementById('bm_dens_resetBtn');
bm_dens_RESET_BTN.onclick = function () {
    window.default_BM_dens_plots(); // resets the plot
    bm_dens_SLIDER.forEach((element, index) => { // reset the sliders
        const default_value = window.bm_default_input[bm_dens_plot_variables[index]];
        document.getElementById(element.id).value = default_value;
    });
    bm_dens_value_fields.forEach((element, index) => { // Reset value fields
        const default_value = window.bm_default_input[bm_dens_plot_variables[index]];
        document.getElementById(element.id).innerHTML = default_value;
    });
}

const bm_dens_AGAIN_BTN = document.getElementById('bm_dens_againBtn');
bm_dens_AGAIN_BTN.onclick = function () {
    window.updateBM_dens_plots({
        d: bm_dens_d_slide.value,
        T: bm_dens_T_slide.value
    });
}

for (let entry = 0; entry < bm_dens_SLIDER.length; entry++) {
    bm_dens_SLIDER[entry].oninput = function () {
        let elem_id = bm_dens_SLIDER[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(bm_dens_SLIDER[entry].id).value;
    }
    bm_dens_SLIDER[entry].onchange = function () {
        window.updateBM_dens_plots({
            d: bm_dens_d_slide.value,
            T: bm_dens_T_slide.value
        });
    }
}