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
            'Категория': product.category,
            'Название': product.name,
            'Количество': count,
            'Цена': product.price,
            'Сумма': product.price * count,
            'Фасовка': `${product.unit} ${product.unitName}`,
            // 'Слоты':  product.slotCount ?? 1, 
          }
        }
        return acc;
      }, {}));

    const dataToConvert = {
      data,
      filename: 'Пономенклатурный отчёт',
      delimiter: ',',
      headers: [
        'ID_Номенклатуры', 
        "Категория", 
        "Название", 
        "Количество", 
        "Цена", 
        "Сумма", 
        "Фасовка"
        // "Слоты", 
      ]
    }
    csvDownload(dataToConvert);
  }