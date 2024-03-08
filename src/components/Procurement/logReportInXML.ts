import { toXML } from 'jstoxml';
import dayjs from 'dayjs'

const t = (value) => String(value).trim().normalize();

export const logReportInXML = (orders: any) => {
    const orderList = Object.values(orders).map(order => Object.values(order)[0]);
    const xml = toXML({
        'Заказы': [
                ...orderList.map((item) => {
                    const products = Object.values(item.products).map(({product, count, id}) => ({
                        'Продукт': {
                            'Количество': t(count),
                            'ID_Номенклатуры': t(product.id),
                            'ID_Продукта': t(id),
                            'Категория': t(product.category),
                            'Наименование': t(product.name),
                            'Цена': t(product.price),
                            'Кратко_о_продукте': t(product.about ?? null),
                            'Комментарий_к_продукту': t(product.comment ?? null),
                            'Описание_к_продукту': t(product.description ?? null),
                            'Количество_слотов_кооперации': t(product.slotCount ?? null),
                            'Единица_измерения': t(product.unitName ?? null),
                            'Единиц_измерения_в_единице_фасовки': t(product.unit ?? null),
                            'Вес_в_килограммах': t(product.weight ?? null),
                        }
                    }));
                    return {
                        'Заказ': {
                            'ID_Заказа': t(item.date)   ,
                            'Имя': t(item.name),
                            'ID_Пайщика': t(item.uid),
                            'Согласна_на_замену_продуктов': t(item.wantToChange ? 'Да' : 'Нет'),
                            'Удалять_продукты_на_замену_если_не_дозвонились': t(item.isRemoveIfNotCalled ? 'Да' : 'Нет'),
                            'Телефон': t(item.phone),
                            'Адрес': t(item.address),
                            'Комментарий': t(item.address),
                            'Дата_заказа': dayjs(item.date).format('YYYY-MM-DD HH:MM:ss'),
                            'Продукты': products
                        }
                    }
            })
        ]
    })
    console.log(xml);
}