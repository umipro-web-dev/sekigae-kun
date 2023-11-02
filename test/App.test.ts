// @vitest-environment jsdom

import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "@/App.vue";

describe("main", async () => {
    const wrapper = mount(App);

    const firstGradeInput = wrapper.find(".first");
    await firstGradeInput.setValue("testMember");

    const firstGradeAddBtn = wrapper.find(".firstRegister");
    await firstGradeAddBtn.trigger("click");

    const disableButton = wrapper.find(".disable-all-members");
    await disableButton.trigger("click");

    const somewhereCheckbox = wrapper.findAll("table input");

    test("can disable member", () => {

        somewhereCheckbox.forEach(domWrapper => {
            expect((domWrapper.element as HTMLInputElement).checked).toBe(false);
        })
    });

})
