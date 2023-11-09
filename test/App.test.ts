// @vitest-environment jsdom

import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "@/App.vue";

describe("main", async () => {
    const wrapper = mount(App);

    const maleInput = wrapper.find(".first");
    await maleInput.setValue("testMember");

    const maleAddBtn = wrapper.find(".firstRegister");
    await maleAddBtn.trigger("click");

    const disableButton = wrapper.find(".disable-all-members");
    await disableButton.trigger("click");

    const somewhereCheckbox = wrapper.findAll("table input");

    test("can disable member", () => {

        somewhereCheckbox.forEach(domWrapper => {
            expect((domWrapper.element as HTMLInputElement).checked).toBe(false);
        })
    });

})
