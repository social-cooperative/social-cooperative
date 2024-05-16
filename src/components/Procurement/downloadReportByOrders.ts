import csvDownload from 'json-to-csv-export'
import { productsTotal, toCurrencyStringRu, toLocaleStringRu } from '../../utils';

const generateListFromOrders = (orders) => {
  return Object.entries(orders).flatMap(([userId, ordersByKey]) => {
    return Object.entries(ordersByKey).map(([orderId, order]) => ({
      ...order, orderId, userId
    }));
  })
}

export const downloadReportByOrders = (orders: any) => {
    const data  = generateListFromOrders(orders).sort((a, b) => b.date - a.date).reduce((acc, order, index) => {
      const weight = Object.values(order.products).reduce((acc: number, {product, count}) => {
        if (!product.weight) {
          console.warn(`Для продукта ${product.name} в категории ${product.categoty} не указан вес`);
        }
        acc += product.weight ? count * product.weight : 0;
        return acc;
      }, 0)

  
      acc.push(Object.values(order.products).reduce((accum: any, {count, product, forChange, forCooperate}) => {
        accum.push({
          index,
          'Номер': order.phone,
          'Адрес': order.address,
          'Детали заказа': 
          `Заказ от ${toLocaleStringRu(order.date)} ${toCurrencyStringRu(productsTotal(order.products))}\n\n`
          + `${order.name}\n`
          + `Вес заказа: ${weight}\n кг`
          + `${order.comment}\n`
          + `${order.wantToChange ? 'Есть продукты с заменой, в случае недозвона' : ''}
          ${order.wantToChange ? (order.isRemoveIfNotCalled ? 'удалить их\n\n' : 'заменить их\n\n') : ''}`,
          'ID_Номенклатуры': product.id,
          'Категория': product.category,
          'Название': product.name,
          'Количество': count,
          'Цена': product.price,
          'Сумма': product.price * count,
          'Фасовка': `${product.unit} ${product.unitName}`,
          'Вес': `${product.weight} кг`,
          // 'Слоты': product.slotsCount,
          // 'Для замены': forChange ? 'Да' : 'Нет',
          // 'Для кооперации': forCooperate ? 'Да' : 'Нет',
        })
        return accum;
      }, []))
      return acc;
    }, []).flat()
    const dataToConvert = {
      data,
      filename: 'Позаказный отчёт',
      delimiter: ',',
      headers: [
        'Индекс заказа',
        'Номер', 
        "Адрес", 
        "Детали заказа", 
        'ID_Номенклатуры', 
        "Категория",
        "Название", 
        "Количество", 
        "Цена", 
        "Сумма", 
        'Фасовка', 
        "Вес", 
        // "Слоты", 
        // "Для замены", 
        // "Для кооперации", 
      ]
    }
    csvDownload(dataToConvert);
  }