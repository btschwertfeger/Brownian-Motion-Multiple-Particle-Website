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
# ===================================================================================
# ===================================================================================
// BROWNIAN MOTION FIRST LINE AND HIST PLOT SETTINGS
*/

const bm_Ca_slide = document.getElementById('bm_Ca_slide'),
    bm_T_slide = document.getElementById('bm_T_slide'),
    bm_n_slide = document.getElementById('bm_nlines_slide'),
    bm_SLIDER = document.getElementsByName('bm_slide'),
    bm_value_fields = document.getElementsByName('bm_slide_value'),
    bm_randomStartValue_checkbox = document.getElementById('bm_randomStartValueCheckbox'),
    bm_plot_variables = ["Ca", "T", "nlines", "randomStartValue"];

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
    bm_randomStartValue_checkbox.checked = false;
}

const bm_AGAIN_BTN = document.getElementById('bm_againBtn');
bm_AGAIN_BTN.onclick = function () {
    window.updateBM_plots({
        // d: bm_d_slide.value,
        Ca: bm_Ca_slide.value,
        T: bm_T_slide.value,
        nlines: bm_n_slide.value,
        randomStartValue: bm_randomStartValue_checkbox.checked,
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
            Ca: bm_Ca_slide.value,
            T: bm_T_slide.value,
            nlines: bm_n_slide.value,
            randomStartValue: bm_randomStartValue_checkbox.checked,
        });
    }
}

bm_randomStartValue_checkbox.onchange = function () {
    window.updateBM_plots({
        Ca: bm_Ca_slide.value,
        T: bm_T_slide.value,
        nlines: bm_n_slide.value,
        randomStartValue: bm_randomStartValue_checkbox.checked,
    });
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// BROWNIAN MOTION SECOND LINE AND HIST PLOT SETTINGS
*/


const bm_dens_Ca_slide = document.getElementById('bm_dens_Ca_slide'),
    bm_dens_T_slide = document.getElementById('bm_dens_T_slide'),
    bm_dens_SLIDER = document.getElementsByName('bm_dens_slide'),
    bm_dens_value_fields = document.getElementsByName('bm_dens_slide_value'),
    bm_dens_randomStartValue_checkbox = document.getElementById('bm_dens_randomStartValueCheckbox'),
    bm_dens_plot_variables = ["Ca", "T", "randomStartValue"];

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
    bm_dens_randomStartValue_checkbox.checked = false;
}

const bm_dens_AGAIN_BTN = document.getElementById('bm_dens_againBtn');
bm_dens_AGAIN_BTN.onclick = function () {
    window.updateBM_dens_plots({
        Ca: bm_dens_Ca_slide.value,
        T: bm_dens_T_slide.value,
        randomStartValue: bm_dens_randomStartValue_checkbox.checked,
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
            Ca: bm_dens_Ca_slide.value,
            T: bm_dens_T_slide.value,
            randomStartValue: bm_dens_randomStartValue_checkbox.checked,
        });
    }
}
bm_dens_randomStartValue_checkbox.onchange = function () {
    window.updateBM_dens_plots({
        Ca: bm_dens_Ca_slide.value,
        T: bm_dens_T_slide.value,
        randomStartValue: bm_dens_randomStartValue_checkbox.checked,
    });
}


/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// DRIVING FUNCTION
*/

const df_a_slide = document.getElementById('df_a_slide'),
    df_b_slide = document.getElementById('df_b_slide'),
    df_c_slide = document.getElementById('df_c_slide'),
    df_d_slide = document.getElementById('df_d_slide'),
    df_SLIDER = document.getElementsByName('df_slide'),
    df_value_fields = document.getElementsByName('df_slide_value'),
    df_plot_variables = ["a", "b", "c", "d"],
    X_df_X_input_y0 = document.getElementById("df_X_input_y0");

const df_RESET_BTN = document.getElementById('df_resetBtn');
df_RESET_BTN.onclick = function () {
    window.default_DF_plot(); // resets the plot
    window.defaultPointMovementPlot();
    df_SLIDER.forEach((element, index) => { // reset the sliders
        const default_value = window.bm_default_input[df_plot_variables[index]];
        document.getElementById(element.id).value = default_value;
    });
    df_value_fields.forEach((element, index) => { // Reset value fields
        const default_value = window.bm_default_input[df_plot_variables[index]];
        document.getElementById(element.id).innerHTML = default_value;
    });
    X_df_X_input_y0.value = "1.25";
}

for (let entry = 0; entry < df_SLIDER.length; entry++) {
    df_SLIDER[entry].oninput = function () {
        let elem_id = df_SLIDER[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(df_SLIDER[entry].id).value;
    }
    df_SLIDER[entry].onchange = function () {
        window.update_DF_plot({
            a: df_a_slide.value,
            b: df_b_slide.value,
            c: df_c_slide.value,
            d: df_d_slide.value,
        });
        window.updatePointMovementPLot({
            y0: parseFloat(X_df_X_input_y0.value),
            h: window.default_input_X.h,
            N: window.default_input_X.N,
            a: df_a_slide.value,
            b: df_b_slide.value,
            c: df_c_slide.value,
            d: df_d_slide.value,
        });
    }
}

X_df_X_input_y0.onchange = function () {
    window.updatePointMovementPLot({
        y0: parseFloat(X_df_X_input_y0.value),
        h: window.default_input_X.h,
        N: window.default_input_X.N,
        a: df_a_slide.value,
        b: df_b_slide.value,
        c: df_c_slide.value,
        d: df_d_slide.value,
    });
}