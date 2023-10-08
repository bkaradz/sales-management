import { readable } from 'svelte/store';
import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';


const tabs = new Map([
    ["/", [
        { id: uuidv4(), name: 'Company', hidden: false, selected: false, url: "/" },
        { id: uuidv4(), name: 'Users', hidden: false, selected: true, url: "/users" },
        { id: uuidv4(), name: 'Expense Centres', hidden: false, selected: false, url: "/expenses" },
        { id: uuidv4(), name: 'Currency Exchange', hidden: false, selected: false, url: "/currency" }
    ]],
    ["/contacts", [
        { id: uuidv4(), name: 'Contacts', hidden: true, selected: true, url: "/contacts" },
        { id: uuidv4(), name: 'View', hidden: true, selected: false, url: "/contacts/view" },
        { id: uuidv4(), name: 'Edit', hidden: true, selected: false, url: "/contacts/edit" },
        { id: uuidv4(), name: 'Create', hidden: false, selected: false, url: "/contacts/create" },
    ]],
    ["/products", [
        { id: uuidv4(), name: 'Products', hidden: true, selected: true, url: "/products" },
        { id: uuidv4(), name: 'View', hidden: true, selected: false, url: "/products/view" },
        { id: uuidv4(), name: 'Create', hidden: false, selected: false, url: "/products/create" },
        { id: uuidv4(), name: 'Edit', hidden: true, selected: false, url: "/products/edit" },
    ]],
    ["/sales", [
        { id: uuidv4(), name: 'Sales', hidden: false, selected: true, url: "/sales" },
        { id: uuidv4(), name: 'View', hidden: false, selected: false, url: "/sales/view" },
        { id: uuidv4(), name: 'Create', hidden: false, selected: false, url: "/sales/create" },
        { id: uuidv4(), name: 'Edit', hidden: false, selected: false, url: "/sales/edit" },
    ]],
    ["/settings", [
        { id: uuidv4(), name: 'Settings', hidden: false, selected: true, url: "/settings" },
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
