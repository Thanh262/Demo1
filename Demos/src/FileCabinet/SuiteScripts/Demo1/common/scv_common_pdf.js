/**
 * @NApiVersion 2.1
 */
define(['N/render'],
    /**
 * @param{render} render
 */
    (render) => {
        
        const addFontVietnamese = (objRender) => {
            objRender.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "libPdf",
                data: {
                    font: {
                        times: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1281&amp;c=9684031_SB1&amp;h=5FjCLDpRFo6UVqmwFNJWO73gr5V3sIWVI9J8sIwFU8ni5HNy&amp;_xt=.ttf',
                        times_bold: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1280&amp;c=9684031_SB1&amp;h=sg-3gzG6XRNvDuoXD0x-e4FipKGSR95I086vEHHqrf9nCTHU&amp;_xt=.ttf',
                        times_italic: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1278&amp;c=9684031_SB1&amp;h=bd_O6KFRs3ktOV764JXgj2XXwvAbEctxy_CnnJHAJ7svAqXP&amp;_xt=.ttf',
                        times_bolditalic: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1279&amp;c=9684031_SB1&amp;h=7HfV81HtMVd53-Wr7dXVCN_LU7Pgu5YygHEYgyUTtEK1R6Nc&amp;_xt=.ttf',
                    }
                }
            })
        }

        return {
            addFontVietnamese: addFontVietnamese
        }

    });
