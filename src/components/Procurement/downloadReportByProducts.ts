import csvDownload from 'json-to-csv-export'

export const downloadReportByProducts = (orders: any) => {
    const data = Object.values(Object.values(orders)
      .flatMap(item => Object.values(item))
      .flatMap(({products}) => Object.values(products))
      .reduce((acc, {count, product} /** [{count, product}]*/) => {
        if (acc[product.id]) {
          acc[product.id]['Количество'] += count;
          acc[product.id]['Сумма'] += count* product.price;
        } else {
          acc[product.id] = {
            'ID_Номенклатуры': product.id,
            'Название': product.name,
            'Категория': product.category,
            'Количество': count,
            'Слоты':  product.slotCount ?? 1, 
            'Цена': product.price,
            'Сумма': product.price * count,
            'Фасовка': `${product.unit} ${product.unitName}`,
          }
        }
        return acc;
      }, {}));

    const dataToConvert = {
      data,
      filename: 'Пономенклатурный отчёт',
      delimiter: ',',
      headers: ['ID_Номенклатуры', "Название", "Категория", "Количество", "Слоты", "Цена", "Сумма", "Фасовка"]
    }
    csvDownload(dataToConvert);
  }