import csvDownload from 'json-to-csv-export'

export const downloadReportByPosition = (products) => {

    const data = Object.entries(products).map(([productId, product]) => ({
      'Коэффициент': product.coefficient ?? null,
      'ID_Номенклатуры': productId ?? null,
      'Категория': product.category ?? null,
      'Название': product.name ?? null,
      'Комментарий': product.comment ?? null,
      'Описание': product.description ?? null,
      'Вес': product.weight ?? null,
      'Цена': product.price ?? null,
      'Единица измерения': product.unitName ?? null,
      'Единица измерения в фасовке': product.unit ?? null,
      'Слоты':  product.slotCount ?? 1, 
      'Поставщик': product.supplier ?? null,
      'Скрыт на сайте?': product.isHiddent ? 'Да' : 'Нет',
    }))

    const dataToConvert = {
      data,
      filename: 'Снапшот номенклатуры с сайта ',
      delimiter: ',',
      headers: [
        'Коэффициент',
        'ID_Номенклатуры',
        'Категория',
        'Название',
        'Комментарий',
        'Описание',
        'Вес',
        'Цена',
        'Единица измерения',
        'Единица измерения в фасовке',
        'Слоты', 
        'Поставщик',
        'Скрыт на сайте?',
      ]
    }
    csvDownload(dataToConvert);
  }
