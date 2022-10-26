// парсинг дат
export function parseDate(mod: 'forJira' | 'forRead'): (someDate?: string) => string
export function parseDate(mod: 'forJira' | 'forRead'): (someDate: string) => string
export function parseDate(mod: 'forJira' | 'forRead') {
    switch (mod) {
        case 'forJira':
            return (someDate?: string) => {
                return !someDate ? new Date().toISOString().split('T')[0] : someDate.split('.').reverse().join('-')
            }
        case 'forRead':
            return (someDate: string) => someDate.split('T')[0].split('-').reverse().join('.')
    }
}

// проверка на пустоту
export function empty(item: string | undefined | null | object | boolean): boolean {
    if (typeof item === 'object' && item != null) {
        if (Array.isArray(item)) {
            return item.length === 0 || item[0] == null;
        } else {
            return Object.keys(item).length === 0;
        }
    }
    return item === false || item == null || item === '';
}
