import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';


const tabs = new Map([
    ["/", [
        // { id: uuidv4(), name: 'Company', hidden: false, selected: false, url: "/" },
        // { id: uuidv4(), name: 'Users', hidden: false, selected: true, url: "/users" },
        // { id: uuidv4(), name: 'Expense Centres', hidden: false, selected: false, url: "/expenses" },
        // { id: uuidv4(), name: 'Currency Exchange', hidden: false, selected: false, url: "/currency" }
    ]],
    ["/contacts", [
        { id: uuidv4(), name: 'Create', hidden: false, selected: false, url: "/contacts/create" },
    ]],
    ["/products", [
        { id: uuidv4(), name: 'Create', hidden: false, selected: false, url: "/products/create" },
    ]],
    ["/sales", [
        // { id: uuidv4(), name: 'Sales', hidden: false, selected: true, url: "/sales" },
    ]],
    ["/settings", [
        // { id: uuidv4(), name: 'Settings', hidden: false, selected: true, url: "/settings" },
        // { id: uuidv4(), name: 'Users', selected: true },
        // { id: uuidv4(), name: 'Expense Centres', selected: false },
        // { id: uuidv4(), name: 'Currency Exchange', selected: false }
    ]],
])

export type TabElement = {
    id: string; name: string; selected: boolean; hidden: boolean; url: string;
}

export type TabElementCombined = {
    url: string, tabElement: TabElement
}

export type AllTabsMap = Map<string, { id: string; name: string; selected: boolean; hidden: boolean; url: string; }[]>

function createTabs() {
    const { subscribe, set, update } = writable(tabs);

    return {
        subscribe,
        changeSelected: (tab: TabElementCombined) => {
            update((allTabs) => allTabs.set(tab.url, getElements(tab, allTabs)));
        }
    };
}

const getElements = (tab: TabElementCombined, allTabs: AllTabsMap) => {
    const tabElements = allTabs.get(tab.url)
    if (tabElements) {
        return tabElements.map((tabElement) => {
            if (tabElement.id === tab.tabElement.id) {
                return { ...tabElement, selected: true }
            } else {
                return { ...tabElement, selected: false }
            }
        })
    } else {
        return []
    }
}

export const menuTabsList = createTabs();
