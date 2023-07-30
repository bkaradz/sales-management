import { readable } from 'svelte/store';
import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';


const tabs = new Map([
    ["/", [
        { id: uuidv4(), name: 'Company', selected: false, url: "/" },
        { id: uuidv4(), name: 'Users', selected: true,  url: "/users" },
        { id: uuidv4(), name: 'Expense Centres', selected: false,  url: "/expenses" },
        { id: uuidv4(), name: 'Currency Exchange', selected: false,  url: "/currency"}
    ]],
    ["/contacts", [
        { id: uuidv4(), name: 'Contacts', selected: true },
        { id: uuidv4(), name: 'View', selected: false },
        { id: uuidv4(), name: 'Add', selected: false },
        { id: uuidv4(), name: 'Edit', selected: false },
    ]],
    ["/products", [
        { id: uuidv4(), name: 'Products', selected: true },
        { id: uuidv4(), name: 'View', selected: false },
        { id: uuidv4(), name: 'Add', selected: false },
        { id: uuidv4(), name: 'Edit', selected: false },
    ]],
    ["/sales", [
        { id: uuidv4(), name: 'Sales', selected: true },
        { id: uuidv4(), name: 'View', selected: false },
        { id: uuidv4(), name: 'Add', selected: false },
        { id: uuidv4(), name: 'Edit', selected: false },
    ]],
    ["/settings", [
        { id: uuidv4(), name: 'Settings', selected: true },
        // { id: uuidv4(), name: 'Users', selected: true },
        // { id: uuidv4(), name: 'Expense Centres', selected: false },
        // { id: uuidv4(), name: 'Currency Exchange', selected: false }
    ]],
])

function createTabs() {
    const { subscribe, set, update } = writable(tabs);

    return {
        subscribe,
        changeSelected: (tab: {
            url: string, tabElement: {
                id: string; name: string; selected: boolean;
            }
        }) => {
            update((allTabs) => allTabs.set(tab.url, getElements(tab, allTabs)));
        }
    };
}

const getElements = (tab: {
    url: string, tabElement: {
        id: string; name: string; selected: boolean;
    }
}, allTabs: Map<string, { id: string; name: string; selected: boolean; }[]>) => {
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
